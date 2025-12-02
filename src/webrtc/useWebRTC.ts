import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import useAuthStore from "../stores/useAuthStore";

type PeerConnectionsMap = Record<string, RTCPeerConnection>;
type StreamsMap = Record<string, MediaStream>;

export function useWebRTC(meetingId: string | undefined) {
  const username = useAuthStore((s) => s.user?.firstName);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const signalingSocket = useRef<Socket | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const peerConnections = useRef<PeerConnectionsMap>({});

  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<StreamsMap>({});
  const [remoteUsers, setRemoteUsers] = useState<Record<string, { name: string }>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  
  const createPeerConnection = (userId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.ontrack = (event) => {
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

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) =>
        pc.addTrack(track, localStream.current!)
      );
    } else {
      setRemoteStreams((prev) => ({ ...prev, [userId]: new MediaStream() }));
    }

    peerConnections.current[userId] = pc;
    return pc;
  };

  const createOfferTo = async (userId: string) => {
    const pc = peerConnections.current[userId] || createPeerConnection(userId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    signalingSocket.current?.emit("signal", {
      to: userId,
      data: { sdp: pc.localDescription },
    });
  };

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
  useEffect(() => {
    if (!meetingId) return;
    let cancelled = false;

    (async () => {
      let finalStream: MediaStream | null = null;
      try {
        finalStream = await navigator.mediaDevices.getUserMedia({
          video: true, 
          audio: true, 
        });
      } catch (error) {
        console.warn("Error al obtener medios locales (video+audio):", error);
        try {
            finalStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (audioError) {
            console.warn("No se pudo obtener ni audio ni video. Creando stream vacío.");
            finalStream = new MediaStream(); 
        }
      }

      if (cancelled || !finalStream) return;

      setupVoiceDetection(finalStream);

      localStream.current = finalStream;
      setLocalStreamState(finalStream); 
      const videoTracks = finalStream.getVideoTracks();
      if (videoTracks.length > 0) {
          videoTracks[0].enabled = false;
          videoTracks[0].enabled = true; 
          console.log("Forzado re-encendido de la pista de video.");
      }

      const socket = io(import.meta.env.VITE_SIGNALING_SERVER_URL, {
        query: { room: meetingId, name: username },
      });

      signalingSocket.current = socket;

      socket.on("usersInRoom", async (users) => {
        const formatted = users.reduce((acc: any, u: any) => {
          acc[u.id] = { name: u.name };
          return acc;
        }, {});

        setRemoteUsers((prev) => ({ ...prev, ...formatted }));
        setRemoteStreams((prev) => ({ ...prev }));

        for (const u of users) await createOfferTo(u.id);
      });

      socket.on("newUserConnected", async ({ id, name }) => {
        setRemoteUsers((prev) => ({ ...prev, [id]: { name } }));
        setRemoteStreams((prev) => ({ ...prev }));
        await createOfferTo(id);
      });

      socket.on("signal", async ({ from, data }) => {
        const pc = peerConnections.current[from] || createPeerConnection(from);

        if (data.sdp) {
          const sdp = new RTCSessionDescription(data.sdp);

          if (sdp.type === 'offer') {
            
            await pc.setRemoteDescription(sdp);
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            signalingSocket.current?.emit("signal", {
                to: from,
                data: { sdp: pc.localDescription },
            });
            
          } else if (sdp.type === 'answer') {
            
            try {
                if (pc.remoteDescription?.type !== 'answer') { 
                    await pc.setRemoteDescription(sdp);
                }
            } catch (e) {
                console.warn(`Error al establecer RemoteDescription (Answer) para ${from}. Posiblemente ya está estable.`, e);
            }
          }
          
        } else if (data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch {}
        }
      });

      socket.on("userDisconnected", ({ userId }) => {
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
    })();

    return () => {
      cancelled = true;
      signalingSocket.current?.disconnect();
      localStream.current?.getTracks().forEach((t) => t.stop());
      
      Object.values(peerConnections.current).forEach(pc => pc.close()); 
    };
  }, [meetingId, username]); 

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