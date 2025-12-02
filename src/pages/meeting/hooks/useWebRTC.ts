import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import useAuthStore from "../../../stores/useAuthStore";

type PeerConnectionsMap = Record<string, RTCPeerConnection>;
type StreamsMap = Record<string, MediaStream>;

// 💡 FUNCIÓN DE UTILIDAD: Retraso para mitigar la "race condition" de WebRTC inicial
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useWebRTC(meetingId: string | undefined) {
  const username = useAuthStore((s) => s.user?.firstName);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const signalingSocket = useRef<Socket | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const peerConnections = useRef<PeerConnectionsMap>({});
  // 🚀 Flag para saber si el stream local está listo
  const isStreamReady = useRef<boolean>(false);
  // 🚀 Cola de señales pendientes para procesar cuando el stream esté listo
  const pendingSignals = useRef<Array<{ from: string; data: any }>>([]);
  // 🚀 ID del socket local para determinar "politeness" en Perfect Negotiation
  const localSocketId = useRef<string | null>(null);
  // 🚀 Track de estados de negociación por peer
  const makingOffer = useRef<Record<string, boolean>>({});
  // 🚀 Cola de ICE candidates pendientes por peer (para cuando llegan antes de la descripción remota)
  const pendingIceCandidates = useRef<Record<string, RTCIceCandidate[]>>({});

  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<StreamsMap>({});
  const [remoteUsers, setRemoteUsers] = useState<Record<string, { name: string }>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 🚀 Función para agregar pistas locales a una conexión peer
  const addLocalTracksToConnection = useCallback((pc: RTCPeerConnection) => {
    if (!localStream.current) return false;
    
    const senders = pc.getSenders();
    const existingTracks = senders.map(s => s.track?.id).filter(Boolean);
    
    localStream.current.getTracks().forEach((track) => {
      // Solo agregar si no existe ya
      if (!existingTracks.includes(track.id)) {
        pc.addTrack(track, localStream.current!);
      }
    });
    return true;
  }, []);

  // 🚀 Función para procesar ICE candidates pendientes
  const processPendingIceCandidates = useCallback(async (userId: string) => {
    const pc = peerConnections.current[userId];
    const pending = pendingIceCandidates.current[userId];
    
    if (!pc || !pending || pending.length === 0) return;
    
    console.log(`🧊 Procesando ${pending.length} ICE candidates pendientes para ${userId}`);
    
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.warn(`Error agregando ICE candidate pendiente:`, e);
      }
    }
    
    // Limpiar la cola
    pendingIceCandidates.current[userId] = [];
  }, []);

  const createPeerConnection = useCallback((userId: string, forceNew: boolean = false) => {
    // Si ya existe una conexión y no forzamos nueva, devolverla
    if (peerConnections.current[userId] && !forceNew) {
      const existingPc = peerConnections.current[userId];
      // Solo reusar si está en buen estado
      if (existingPc.connectionState !== 'failed' && existingPc.connectionState !== 'closed') {
        return existingPc;
      }
      // Si está fallida o cerrada, cerrarla y crear nueva
      console.log(`🔄 Recreando conexión con ${userId} (estado anterior: ${existingPc.connectionState})`);
      existingPc.close();
    }

    // Inicializar cola de ICE candidates para este peer
    pendingIceCandidates.current[userId] = [];

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });

    pc.ontrack = (event) => {
      console.log(`📹 Track recibido de ${userId}:`, event.track.kind);
      setRemoteStreams((prev) => ({ ...prev, [userId]: event.streams[0] }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalingSocket.current?.emit("signal", {
          to: userId,
          data: { candidate: event.candidate },
        });
      }
    };

    // 🚀 Monitorear cambios de estado de ICE
    pc.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE estado con ${userId}:`, pc.iceConnectionState);
      
      // Si ICE falla, intentar reiniciar
      if (pc.iceConnectionState === 'failed') {
        console.log(`❄️ ICE falló con ${userId}, intentando restart...`);
        pc.restartIce();
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`🔗 Estado de conexión con ${userId}:`, pc.connectionState);
      
      // 🚀 Si la conexión falla, intentar reconectar
      if (pc.connectionState === 'failed') {
        console.log(`❌ Conexión fallida con ${userId}, programando reconexión...`);
        // Dar tiempo y reintentar
        setTimeout(async () => {
          if (peerConnections.current[userId]?.connectionState === 'failed') {
            console.log(`🔄 Reintentando conexión con ${userId}...`);
            // Crear nueva conexión y enviar oferta
            const newPc = createPeerConnection(userId, true);
            addLocalTracksToConnection(newPc);
            
            try {
              const offer = await newPc.createOffer({ iceRestart: true });
              await newPc.setLocalDescription(offer);
              signalingSocket.current?.emit("signal", {
                to: userId,
                data: { sdp: newPc.localDescription },
              });
            } catch (err) {
              console.error(`Error en reconexión con ${userId}:`, err);
            }
          }
        }, 2000);
      }
    };

    // 🚀 Agregar pistas locales si el stream está listo
    if (localStream.current && isStreamReady.current) {
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current!);
        console.log(`📤 Pista ${track.kind} agregada a conexión con ${userId}`);
      });
    }

    peerConnections.current[userId] = pc;
    return pc;
  }, [addLocalTracksToConnection]);

  const createOfferTo = useCallback(async (userId: string) => {
    // 🚀 Esperar a que el stream esté listo
    if (!isStreamReady.current || !localStream.current) {
      console.log(`⏳ Stream no listo, esperando para crear oferta a ${userId}...`);
      await delay(200);
      if (!isStreamReady.current || !localStream.current) {
        console.warn(`⚠️ Stream aún no listo después de espera para ${userId}`);
        return;
      }
    }

    const pc = peerConnections.current[userId] || createPeerConnection(userId);
    
    // 🚀 Verificar si ya estamos en proceso de negociación o si ya está estable con descripción
    if (pc.signalingState !== 'stable' && pc.signalingState !== 'closed') {
      console.log(`⏸️ Conexión con ${userId} no está estable (${pc.signalingState}), omitiendo oferta`);
      return;
    }

    // 🚀 Marcar que estamos haciendo una oferta
    makingOffer.current[userId] = true;

    try {
      // 🚀 Asegurar que las pistas estén agregadas antes de crear la oferta
      addLocalTracksToConnection(pc);

      // Esperar un poco para que addTrack se procese
      await delay(50); 

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log(`📤 Enviando oferta a ${userId}`);
      signalingSocket.current?.emit("signal", {
        to: userId,
        data: { sdp: pc.localDescription },
      });
    } catch (err) {
      console.error(`❌ Error creando oferta para ${userId}:`, err);
    } finally {
      makingOffer.current[userId] = false;
    }
  }, [createPeerConnection, addLocalTracksToConnection]);

  const setupVoiceDetection = (stream: MediaStream) => {
    if (stream.getAudioTracks().length === 0) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const mic = audioContext.createMediaStreamSource(stream);

    mic.connect(analyser);
    analyser.fftSize = 256;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setIsSpeaking(avg > 30); 
      requestAnimationFrame(loop);
    };

    loop();
  };

  
  useEffect(() => {
    if (localStreamState && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamState;
        console.log("Asignación de srcObject asegurada.");

        if (localStreamState.getVideoTracks().length === 0) {
            console.error("⛔ ALERTA: No se encontró la Pista de Video. El stream es solo audio.");
        } else {
            console.log("✅ Pista de video encontrada.");
        }
    }
  }, [localStreamState]); 

  // 🚀 Handler de señales con Perfect Negotiation Pattern
  const handleSignal = useCallback(async (from: string, data: any) => {
    // Si el stream no está listo y es una oferta, encolar
    if (!isStreamReady.current && data.sdp?.type === 'offer') {
      console.log(`⏳ Stream no listo, encolando señal de ${from}`);
      pendingSignals.current.push({ from, data });
      return;
    }

    const pc = peerConnections.current[from] || createPeerConnection(from);

    if (data.sdp) {
      const sdp = new RTCSessionDescription(data.sdp);

      if (sdp.type === 'offer') {
        // 🚀 PERFECT NEGOTIATION: Determinar si somos "polite" o "impolite"
        // El peer con ID de socket menor es "polite" (cede ante colisiones)
        const isPolite = localSocketId.current ? localSocketId.current < from : true;
        const offerCollision = makingOffer.current[from] || pc.signalingState !== 'stable';
        
        // 🚀 Si hay colisión y somos impolite, ignoramos la oferta entrante
        const ignoreOffer = !isPolite && offerCollision;
        
        if (ignoreOffer) {
          console.log(`🔄 Glare detectado con ${from}, ignorando oferta (somos impolite)`);
          return;
        }

        console.log(`📥 Procesando oferta de ${from} (polite: ${isPolite}, collision: ${offerCollision})`);
        
        try {
          // 🚀 Si estamos en medio de algo y somos polite, hacer rollback
          if (offerCollision && isPolite) {
            console.log(`🔄 Rollback para aceptar oferta de ${from}`);
            await pc.setLocalDescription({ type: 'rollback' });
          }
          
          // 🚀 Asegurar que las pistas locales estén agregadas antes de responder
          addLocalTracksToConnection(pc);
          
          await pc.setRemoteDescription(sdp);
          
          // 🚀 Procesar ICE candidates que llegaron antes de la descripción
          await processPendingIceCandidates(from);
          
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          console.log(`📤 Enviando respuesta a ${from}`);
          signalingSocket.current?.emit("signal", {
            to: from,
            data: { sdp: pc.localDescription },
          });
        } catch (err) {
          console.error(`❌ Error procesando oferta de ${from}:`, err);
        }
        
      } else if (sdp.type === 'answer') {
        console.log(`📥 Procesando respuesta de ${from}, estado actual: ${pc.signalingState}`);
        try {
          // 🚀 Solo establecer la respuesta si estamos esperando una (have-local-offer)
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(sdp);
            console.log(`✅ Respuesta de ${from} establecida correctamente`);
            
            // 🚀 Procesar ICE candidates que llegaron antes de la descripción
            await processPendingIceCandidates(from);
          } else {
            console.log(`⏭️ Ignorando respuesta de ${from}, estado: ${pc.signalingState}`);
          }
        } catch (e) {
          console.warn(`Error al establecer RemoteDescription (Answer) para ${from}:`, e);
        }
      }
      
    } else if (data.candidate) {
      const candidate = new RTCIceCandidate(data.candidate);
      
      // 🚀 Si no tenemos descripción remota aún, encolar el candidate
      if (!pc.remoteDescription || !pc.remoteDescription.type) {
        console.log(`🧊 Encolando ICE candidate de ${from} (esperando descripción remota)`);
        if (!pendingIceCandidates.current[from]) {
          pendingIceCandidates.current[from] = [];
        }
        pendingIceCandidates.current[from].push(candidate);
        return;
      }
      
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.warn(`Error agregando ICE candidate de ${from}:`, e);
      }
    }
  }, [createPeerConnection, addLocalTracksToConnection, processPendingIceCandidates]);

  useEffect(() => {
    if (!meetingId) return;
    let cancelled = false;

    // 🚀 Resetear todos los estados al montar
    isStreamReady.current = false;
    pendingSignals.current = [];
    localSocketId.current = null;
    makingOffer.current = {};
    pendingIceCandidates.current = {};

    (async () => {
      let finalStream: MediaStream | null = null;
      
      console.log("🎥 Solicitando permisos de cámara y micrófono...");
      
      try {
        finalStream = await navigator.mediaDevices.getUserMedia({
          video: true, 
          audio: true, 
        });
        console.log("✅ Permisos concedidos: video y audio");
      } catch (error) {
        console.warn("Error al obtener medios locales (video+audio):", error);
        try {
          finalStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log("✅ Permisos concedidos: solo audio");
        } catch (audioError) {
          console.warn("No se pudo obtener ni audio ni video. Creando stream vacío.");
          finalStream = new MediaStream(); 
        }
      }

      if (cancelled || !finalStream) return;

      // 🚀 IMPORTANTE: Primero guardar el stream y marcarlo como listo
      localStream.current = finalStream;
      isStreamReady.current = true;
      setLocalStreamState(finalStream);
      
      console.log("✅ Stream local listo:", {
        videoTracks: finalStream.getVideoTracks().length,
        audioTracks: finalStream.getAudioTracks().length,
      });

      setupVoiceDetection(finalStream);

      // 🚀 Ahora conectar el socket (después de que el stream esté listo)
      console.log("🔌 Conectando al servidor de señalización...");
      const socket = io(import.meta.env.VITE_SIGNALING_SERVER_URL, {
        query: { room: meetingId, name: username },
      });

      signalingSocket.current = socket;

      socket.on("connect", () => {
        // 🚀 Guardar el ID del socket para Perfect Negotiation
        localSocketId.current = socket.id || null;
        console.log("✅ Conectado al servidor de señalización, ID:", socket.id);
      });

      socket.on("usersInRoom", async (users) => {
        console.log(`👥 Usuarios ya en la sala:`, users);
        const formatted = users.reduce((acc: any, u: any) => {
          acc[u.id] = { name: u.name };
          return acc;
        }, {});

        setRemoteUsers((prev) => ({ ...prev, ...formatted }));

        // 🚀 NO crear ofertas aquí - los usuarios existentes nos enviarán ofertas
        // Solo preparamos las conexiones peer para estar listos
        for (const u of users) {
          if (!peerConnections.current[u.id]) {
            createPeerConnection(u.id);
            console.log(`🔗 Conexión peer preparada para ${u.name} (${u.id})`);
          }
        }
      });

      socket.on("newUserConnected", async ({ id, name }) => {
        console.log(`🆕 Nuevo usuario conectado: ${name} (${id})`);
        setRemoteUsers((prev) => ({ ...prev, [id]: { name } }));
        // 🚀 Solo el usuario existente crea la oferta al nuevo
        await createOfferTo(id);
      });

      socket.on("signal", async ({ from, data }) => {
        await handleSignal(from, data);
      });

      socket.on("userDisconnected", ({ userId }) => {
        console.log(`👋 Usuario desconectado: ${userId}`);
        const pc = peerConnections.current[userId];
        if (pc) pc.close();
        delete peerConnections.current[userId];

        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });

        setRemoteUsers((prev) => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });
      });

      // 🚀 Procesar cualquier señal que haya llegado mientras obteníamos el stream
      if (pendingSignals.current.length > 0) {
        console.log(`📋 Procesando ${pendingSignals.current.length} señales pendientes...`);
        const signals = [...pendingSignals.current];
        pendingSignals.current = [];
        for (const { from, data } of signals) {
          await handleSignal(from, data);
        }
      }
    })();

    return () => {
      cancelled = true;
      console.log("🧹 Limpiando recursos de WebRTC...");
      
      // 🚀 Resetear todos los flags y estados
      isStreamReady.current = false;
      pendingSignals.current = [];
      localSocketId.current = null;
      makingOffer.current = {};
      pendingIceCandidates.current = {};
      
      signalingSocket.current?.disconnect();
      signalingSocket.current = null;
      
      localStream.current?.getTracks().forEach((t) => t.stop());
      localStream.current = null;
      
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
    };
  }, [meetingId, username, createOfferTo, handleSignal]); 

  return {
    localVideoRef,
    remoteStreams,
    remoteUsers,
    localStream,
    localStreamState,
    setLocalStreamState,
    isSpeaking,
  };
}