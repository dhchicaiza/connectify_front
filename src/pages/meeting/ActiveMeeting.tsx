import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Meeting.module.scss";
import { connectToChat, disconnectSocket, getSocket } from "../../sockets/socketManager";
import useAuthStore from "../../stores/useAuthStore";
import { leaveMeeting, joinMeeting } from "../../api/meetings"; // Se elimina getMeetingById
import { fetchUserProfile } from "../../api/user";

// 💡 NUEVAS IMPORTACIONES DE LOS HOOKS DE A/V
import { useWebRTC } from "./hooks/useWebRTC";
import { useMediaControls } from "./hooks/useMediaControls";

/**
 * Interface for chat messages.
 */
interface ChatMessage {
  user: string;
  text: string;
  room: string;
  time: string;
}

// ⚠️ Se remueve la interfaz ParticipantDisplay, ya que los datos de participantes 
// vendrán de useWebRTC.

/**
 * Interfaz para el componente auxiliar de video remoto.
 */
interface RemoteParticipantProps {
  userId: string;
  stream: MediaStream;
  name: string;
  initials: string;
  // No necesitamos pasar styles si RemoteParticipantVideo se declara dentro de ActiveMeeting
}

// 💡 COMPONENTE AUXILIAR para asignar el stream remoto
// Se declara *dentro* de ActiveMeeting para mantener el scope o se mueve a un archivo separado.
// Para este ejemplo, lo dejaremos como una función dentro del archivo, que es una práctica común en TSX.
const RemoteParticipantVideo: React.FC<RemoteParticipantProps & { styles: any }> = ({ stream, name, initials, styles }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Chequea si el stream tiene una pista de video y si está habilitada
    const isVideoTrackEnabled = stream?.getVideoTracks().some(t => t.enabled);

    return (
        <div className={styles.participantCard}>
            <video
                ref={videoRef}
                autoPlay
                className={styles.videoElement}
                style={{ display: isVideoTrackEnabled ? 'block' : 'none' }}
            />
            {!isVideoTrackEnabled && (
                <div className={styles.participantInitials}>
                    {initials}
                </div>
            )}
            <div className={styles.nameOverlay}>
                {name} 
            </div>
        </div>
    );
};


/**
 * Active meeting page component that displays video participants,
 * controls, and a real-time chat sidebar.
 */
const ActiveMeeting: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") || "";
  const { user } = useAuthStore();
  
  const [showChat, setShowChat] = useState(true);
  
  // ⚠️ ESTADOS DE A/V REMOVIDOS (Ahora vienen del hook)
  // const [isMuted, setIsMuted] = useState(true); 
  // const [isVideoOff, setIsVideoOff] = useState(false);
  
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  // ⚠️ ELIMINADO: const [participants, setParticipants] = useState<ParticipantDisplay[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userName = user?.displayName || user?.firstName || "Usuario";

  // ------------------------------------------
  // 💡 INTEGRACIÓN DE HOOKS DE A/V
  // ------------------------------------------
  const {
    localVideoRef, // Ref para el <video> local
    remoteStreams, // Streams de video/audio remotos (Map<userId, MediaStream>)
    remoteUsers, // Info de usuarios remotos (Map<userId, { name }>)
    localStreamState, // Stream local actual (para controles)
    setLocalStreamState, // Setter del stream local
    isSpeaking, // Detección de voz 
  } = useWebRTC(roomId);

  const { 
    isMuted, 
    isCameraOff, 
    toggleMute, 
    toggleCamera 
  } = useMediaControls(
    localStreamState, 
    setLocalStreamState 
  );
  // ------------------------------------------


  // Fetch current user ID from profile (Mantenido)
  useEffect(() => { /* ... lógica de fetchUserProfile ... */ 
    const getCurrentUserId = async () => {
        try {
            const profile = await fetchUserProfile();
            if (profile?.data?.id) {
                setCurrentUserId(profile.data.id);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };
    
    if (user) {
        getCurrentUserId();
    }
  }, [user]);

  /**
   * Generates initials from a name string. (Mantenido)
   */
  const generateInitials = (name: string): string => {
    if (!name || name.trim().length === 0) {
      return "??";
    }
    
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else if (words[0].length >= 2) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return (words[0][0] + words[0][0]).toUpperCase();
    }
  };

  // ⚠️ FUNCIÓN fetchParticipants ELIMINADA (Gestionada por useWebRTC)
  // ⚠️ useCallback ELIMINADO

  useEffect(() => {
    if (!roomId) {
      navigate("/meeting");
      return;
    }

    // Join the meeting when component mounts (API call mantenida)
    const joinMeetingOnMount = async () => {
      try {
        console.log("🔗 Joining meeting:", roomId);
        await joinMeeting(roomId);
        console.log("✅ Successfully joined meeting");
      } catch (error) {
        console.error("❌ Error joining meeting:", error);
      }
    };

    joinMeetingOnMount();

    // ⚠️ ELIMINADO: Lógica de Polling por API
    // clearInterval(participantsInterval);

    // Conexión al chat server (Mantenida)
    const socket = connectToChat(roomId);

    // ... Lógica de conexión de socket, listeners y receiveMessage (Mantenida) ...
    if (socket.connected) {
      setIsSocketConnected(true);
      setupSocketListeners(socket);
    } else {
      socket.on("connect", () => {
        console.log("Socket connected, setting up listeners");
        setIsSocketConnected(true);
        setupSocketListeners(socket);
      });
    }

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsSocketConnected(false);
    });

    function setupSocketListeners(socket: any) {
      socket.on("receiveMessage", (msg: ChatMessage) => {
        console.log("Message received:", msg);
        setChatMessages((prev) => {
          const exists = prev.some(
            (m) => m.time === msg.time && m.user === msg.user && m.text === msg.text
          );
          if (exists) {
            console.log("Duplicate message ignored");
            return prev;
          }
          return [...prev, msg];
        });
      });

      // ⚠️ ELIMINADO: Los eventos de chat "userJoined"/"userLeft" ya no disparan fetchParticipants
      socket.on("userJoined", () => {
         console.log("User joined via chat, participants handled by WebRTC.");
      });

      socket.on("userLeft", () => {
         console.log("User left via chat, participants handled by WebRTC.");
      });
    }


    // Cleanup on unmount (Mantenida)
    return () => {
      // ⚠️ ELIMINADO: Limpieza del intervalo de polling
      // clearInterval(participantsInterval); 
      
      socket.off("receiveMessage");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("connect");
      if (roomId) {
        leaveMeeting(roomId).catch(console.error);
      }
      disconnectSocket();
    };
  // ⚠️ fetchParticipants eliminado de las dependencias
  }, [roomId, navigate, user]); 

  // ... Auto-scroll, handleExit, y handleSendMessage se mantienen iguales ...
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleExit = async () => { /* ... lógica de handleExit ... */
    if (roomId) {
      try {
        await leaveMeeting(roomId);
      } catch (error) {
        console.error("Error leaving meeting:", error);
      }
    }
    disconnectSocket();
    navigate("/meeting");
  };

  const handleSendMessage = (e: React.FormEvent) => { /* ... lógica de handleSendMessage ... */
    e.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !roomId) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      console.error("Socket instance not found, attempting to reconnect...");
      const newSocket = connectToChat(roomId);
      setTimeout(() => {
        if (newSocket.connected) {
          sendMessageToSocket(newSocket, trimmedMessage);
        } else {
          alert("No se pudo conectar al servidor de chat. Verifica que el servidor esté corriendo en el puerto 3001.");
        }
      }, 1000);
      return;
    }

    if (!socket.connected) {
      console.error("Socket not connected, attempting to reconnect...");
      socket.connect();
      setTimeout(() => {
        if (socket?.connected) {
          sendMessageToSocket(socket, trimmedMessage);
        } else {
          alert("No se pudo conectar al servidor de chat. Verifica que el servidor esté corriendo en el puerto 3001.");
        }
      }, 1000);
      return;
    }

    sendMessageToSocket(socket, trimmedMessage);
  };

  const sendMessageToSocket = (socket: any, text: string) => { /* ... lógica de sendMessageToSocket ... */
    const timestamp = new Date().toISOString();
    const newMessage: ChatMessage = {
      user: userName,
      text: text,
      room: roomId,
      time: timestamp,
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      socket.emit("sendMessage", newMessage);
    } catch (error) {
      console.error("Error emitting message:", error);
      setChatMessages((prev) => 
        prev.filter((m) => !(m.time === timestamp && m.user === userName && m.text === text))
      );
      alert("Error al enviar el mensaje. Por favor, intenta de nuevo.");
    }
  };


  return (
    <div className={styles.meetingPage}>
      {/* Header de la reunión (Mantenido) */}
      <header className={styles.meetingHeader}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className={styles.meetingTitle}>Reunión de Equipo</h1>
          {roomId && (
            <p className={styles.roomId}>ID: {roomId}</p>
          )}
        </div>
        <button onClick={handleExit} className={styles.exitButton}>
          Salir
        </button>
      </header>

      {/* Contenido principal */}
      <div
        className={`${styles.meetingContent} ${
          showChat ? styles.withChat : ""
        }`}
      >
        {/* 💡 Grid de participantes: AHORA RENDERIZA STREAMS DE WEBRTC */}
        <div className={styles.participantsGrid}>
          
          {/* 1. Video/Audio Local (Siempre renderizado primero) */}
          <div key="local" className={styles.participantCard}>
            <video
              ref={localVideoRef} // 💡 Usa la ref del hook
              autoPlay
              muted
              className={styles.videoElement}
              // Oculta/Muestra basado en el estado del hook
              style={{ display: isCameraOff ? 'none' : 'block' }} 
            />
            {/* Si la cámara está apagada o no hay video, muestra el avatar */}
            {(isCameraOff || !localStreamState?.getVideoTracks().length) && (
              <div className={styles.participantInitials} data-speaking={isSpeaking ? "true" : "false"}>
                {generateInitials(userName)}
              </div>
            )}
            <div className={styles.nameOverlay}>
              {userName} (Tú) {isMuted && "🔇"}
            </div>
          </div>

          {/* 2. Videos/Audios Remotos */}
          {Object.entries(remoteStreams).map(([userId, stream]) => {
            const participantName = remoteUsers[userId]?.name || `Usuario Remoto`;
            
            return (
              <RemoteParticipantVideo 
                key={userId}
                userId={userId}
                stream={stream}
                name={participantName}
                initials={generateInitials(participantName)}
                styles={styles} // Pasamos los estilos
              />
            );
          })}
        </div>

        {/* 💡 Controles: AHORA USAN LAS FUNCIONES DEL HOOK */}
        <div className={styles.controls}>
          {/* Botón de Silencio */}
          <button
            onClick={toggleMute} // 💡 Función del hook
            className={`${styles.controlButton} ${isMuted ? styles.muted : ""}`}
            aria-label={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
          >
            <svg
              className={styles.controlIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMuted ? (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              )}
            </svg>
          </button>

          {/* Botón de Video */}
          <button
            onClick={toggleCamera} // 💡 Función del hook
            className={`${styles.controlButton} ${
              isCameraOff ? styles.videoOff : "" // 💡 Estado del hook
            }`}
            aria-label={isCameraOff ? "Activar cámara" : "Apagar cámara"}
          >
            <svg
              className={styles.controlIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* Botón de Chat (Mantenido) */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`${styles.controlButton} ${
              showChat ? styles.active : ""
            }`}
          >
            <svg
              className={styles.controlIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay para móviles (Mantenido) */}
      {showChat && (
        <div 
          className={`${styles.chatOverlay} ${styles.chatOpen}`}
          onClick={() => setShowChat(false)}
        />
      )}

      {/* Sidebar de chat (Mantenido y con corrección de sintaxis) */}
      {showChat && (
        <div className={`${styles.chatSidebar} ${styles.chatOpen}`}>
          {/* ... resto del JSX del chat (Header, mensajes, form) ... */}
          <div className={styles.chatHeader}>
            <div>
              <h2 className={styles.chatTitle}>Chat</h2>
              <div style={{ fontSize: "0.75rem", color: isSocketConnected ? "#10b981" : "#ef4444" }}>
                {isSocketConnected ? "● Conectado" : "● Desconectado"}
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className={styles.closeChatButton}
            >
              <svg
                className={styles.closeIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className={styles.chatMessages}>
            {chatMessages.length === 0 ? (
              <p className={styles.emptyChat}>No hay mensajes aún. ¡Sé el primero en escribir!</p>
            ) : (
              chatMessages.map((msg, index) => {
                const messageTime = new Date(msg.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isOwnMessage = msg.user === userName;

                return (
                  <div
                    key={`${msg.time}-${index}`}
                    className={`${styles.chatMessage} ${isOwnMessage ? styles.ownMessage : ""}`}
                  >
                    <div className={styles.messageHeader}>
                      <span className={styles.messageUser}>{msg.user}</span>
                      <span className={styles.messageTime}>{messageTime}</span>
                    </div>
                    <div className={styles.messageBubble}>{msg.text}</div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.chatInput}
              placeholder="Escribe un mensaje..."
            />
            <button
              type="submit"
              className={styles.sendButton}
            >
              <svg
                className={styles.sendIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ActiveMeeting;