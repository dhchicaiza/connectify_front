import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Meeting.module.scss";
import { connectToChat, disconnectSocket, getSocket } from "../../sockets/socketManager";
import useAuthStore from "../../stores/useAuthStore";
import { leaveMeeting, getMeetingById, joinMeeting, generateMeetingSummary } from "../../api/meetings";
import type { MeetingSummary } from "../../api/meetings";
import { fetchUserProfile } from "../../api/user";
import {
  initWebRTC,
  disableOutgoingStream,
  enableOutgoingStream,
  disableOutgoingVideo,
  enableOutgoingVideo,
  getLocalStream
} from "../../webrtc/webrtc";

/**
 * Interface for chat messages.
 */
interface ChatMessage {
  user: string;
  text: string;
  room: string;
  time: string;
}

/**
 * Interface for meeting participants with display information.
 */
interface ParticipantDisplay {
  userId: string;
  name: string;
  initials: string;
}

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
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [participants, setParticipants] = useState<ParticipantDisplay[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isWebRTCInitialized, setIsWebRTCInitialized] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const userName = user?.displayName || user?.firstName || "Usuario";

  // Fetch current user ID from profile
  useEffect(() => {
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
   * Generates initials from a name string.
   * Takes first letter of first name and first letter of last name.
   * If only one word, takes first two letters.
   */
  const generateInitials = (name: string): string => {
    if (!name || name.trim().length === 0) {
      return "??";
    }
    
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      // First letter of first name + first letter of last name
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else if (words[0].length >= 2) {
      // If only one word, take first two letters
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // If single character, duplicate it
      return (words[0][0] + words[0][0]).toUpperCase();
    }
  };

  /**
   * Fetches meeting participants and updates the state.
   */
  const fetchParticipants = useCallback(async () => {
    if (!roomId) return;

    try {
      const meeting = await getMeetingById(roomId);
      const activeParticipants = meeting.participants.filter(p => p.active);
      
      console.log("📊 Fetching participants:", {
        totalParticipants: meeting.participants.length,
        activeParticipants: activeParticipants.length,
        currentUserId,
        participants: activeParticipants.map(p => ({ userId: p.userId, active: p.active }))
      });
      
      const participantsWithInfo: ParticipantDisplay[] = activeParticipants.map((p) => {
        // Check if this participant is the current user using userId (UUID)
        const isCurrentUser = currentUserId && p.userId === currentUserId;
        
        if (isCurrentUser && user) {
          // Use current user's info from the store
          const displayName = user.displayName || 
                            (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                            user.firstName ||
                            user.email?.split('@')[0] ||
                            "Usuario";
          return {
            userId: p.userId,
            name: displayName,
            initials: generateInitials(displayName),
          };
        }
        
        // For other participants, we need to get their info
        // For now, use a generic name based on userId
        // TODO: In the future, we could fetch user info by ID from the API
        const participantName = `Usuario ${p.userId.substring(0, 8)}`;
        
        return {
          userId: p.userId,
          name: participantName,
          initials: generateInitials(participantName),
        };
      });

      console.log("✅ Participants processed:", participantsWithInfo);
      setParticipants(participantsWithInfo);
    } catch (error) {
      console.error("❌ Error fetching participants:", error);
      // If there's an error, at least show the current user
      if (user) {
        const displayName = user.displayName || 
                          (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                          user.firstName ||
                          user.email?.split('@')[0] ||
                          "Usuario";
        setParticipants([{
          userId: currentUserId || "current",
          name: displayName,
          initials: generateInitials(displayName),
        }]);
      }
    }
  }, [roomId, user, currentUserId]);

  useEffect(() => {
    if (!roomId) {
      navigate("/meeting");
      return;
    }

    // Join the meeting when component mounts (in case user navigated directly)
    const joinMeetingOnMount = async () => {
      try {
        console.log("🔗 Joining meeting:", roomId);
        await joinMeeting(roomId);
        console.log("✅ Successfully joined meeting");
      } catch (error) {
        console.error("❌ Error joining meeting:", error);
        // If join fails, still try to fetch participants (user might already be in)
      }
    };

    joinMeetingOnMount();

    // Initialize WebRTC for audio and video
    if (!isWebRTCInitialized && userName && roomId) {
      console.log("🎙️ Initializing WebRTC audio and video...");
      initWebRTC(roomId, userName)
        .then(() => {
          console.log("✅ WebRTC initialized successfully");
          setIsWebRTCInitialized(true);
          // Get and store local stream
          const stream = getLocalStream();
          if (stream) {
            setLocalStream(stream);
            console.log("📹 Local stream acquired:", {
              videoTracks: stream.getVideoTracks().length,
              audioTracks: stream.getAudioTracks().length
            });
          }
        })
        .catch((error) => {
          console.error("❌ Failed to initialize WebRTC:", error);
        });
    }

    // Fetch participants immediately
    fetchParticipants();

    // Set up polling to update participants every 2 seconds for faster updates
    const participantsInterval = setInterval(() => {
      console.log("🔄 Polling participants...");
      fetchParticipants();
    }, 2000);

    // Connect to chat server
    const socket = connectToChat(roomId);

    // Wait for connection before setting up listeners
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

    // Listen for incoming messages
    function setupSocketListeners(socket: any) {
      socket.on("receiveMessage", (msg: ChatMessage) => {
        console.log("Message received:", msg);
        setChatMessages((prev) => {
          // Avoid duplicates by checking timestamp and user
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

      // Listen for user join/leave events if available
      socket.on("userJoined", () => {
        console.log("User joined, refreshing participants");
        fetchParticipants();
      });

      socket.on("userLeft", () => {
        console.log("User left, refreshing participants");
        fetchParticipants();
      });
    }

    // Cleanup on unmount
    return () => {
      clearInterval(participantsInterval);
      socket.off("receiveMessage");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("connect");
      if (roomId) {
        leaveMeeting(roomId).catch(console.error);
      }
      disconnectSocket();
    };
  }, [roomId, navigate, user, fetchParticipants, isWebRTCInitialized, userName]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Connect local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log("📹 Local video element connected");
    }
  }, [localStream]);

  /**
   * Handles exiting the meeting and cleaning up resources.
   */
  const handleExit = async () => {
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

  /**
   * Handles sending a chat message via socket.
   */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !roomId) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      console.error("Socket instance not found, attempting to reconnect...");
      // Try to reconnect
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
      // Wait a bit and try again
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

  /**
   * Generates AI summary for the meeting.
   */
  const handleGenerateSummary = async () => {
    if (!roomId || chatMessages.length === 0) {
      alert("No hay mensajes para generar un resumen.");
      return;
    }

    setIsGeneratingSummary(true);

    try {
      console.log("🤖 Generating AI summary...");
      const generatedSummary = await generateMeetingSummary(roomId, chatMessages);
      setSummary(generatedSummary);
      setShowSummary(true);
      console.log("✅ Summary generated successfully:", generatedSummary);
    } catch (error) {
      console.error("❌ Error generating summary:", error);
      alert("Error al generar el resumen. Por favor, intenta de nuevo.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  /**
   * Sends a message through the socket connection.
   */
  const sendMessageToSocket = (socket: any, text: string) => {
    const timestamp = new Date().toISOString();
    const newMessage: ChatMessage = {
      user: userName,
      text: text,
      room: roomId,
      time: timestamp,
    };

    console.log("Sending message:", newMessage);
    console.log("Socket connected:", socket.connected);
    console.log("Socket ID:", socket.id);
    
    // Optimistic update: show message immediately
    setChatMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // Send to server
    try {
      socket.emit("sendMessage", newMessage);
      console.log("Message emitted to server");
    } catch (error) {
      console.error("Error emitting message:", error);
      // Remove the optimistic message if send failed
      setChatMessages((prev) => 
        prev.filter((m) => !(m.time === timestamp && m.user === userName && m.text === text))
      );
      alert("Error al enviar el mensaje. Por favor, intenta de nuevo.");
    }
  };


  return (
    <div className={styles.meetingPage}>
      {/* Header de la reunión */}
      <header className={styles.meetingHeader}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className={styles.meetingTitle}>Reunión de Equipo</h1>
          {roomId && (
            <p className={styles.roomId}>ID: {roomId}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleGenerateSummary}
            className={styles.summaryButton}
            disabled={isGeneratingSummary || chatMessages.length === 0}
            title={chatMessages.length === 0 ? "No hay mensajes para resumir" : "Generar resumen con IA"}
          >
            {isGeneratingSummary ? "Generando..." : "📝 Resumen IA"}
          </button>
          <button onClick={handleExit} className={styles.exitButton}>
            Salir
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <div
        className={`${styles.meetingContent} ${
          showChat ? styles.withChat : ""
        }`}
      >
        {/* Grid de participantes */}
        <div className={styles.participantsGrid}>
          {/* Local user video */}
          <div className={styles.participantCard}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={styles.participantVideo}
              style={{
                display: isVideoOff ? 'none' : 'block',
                transform: 'scaleX(-1)' // Mirror local video
              }}
            />
            {isVideoOff && (
              <div className={styles.participantInitials}>
                {generateInitials(userName)}
              </div>
            )}
            <div className={styles.participantName}>{userName} (Tú)</div>
          </div>

          {/* Remote participants */}
          {participants
            .filter(p => currentUserId && p.userId !== currentUserId)
            .map((participant) => {
              const videoEl = document.getElementById(`${participant.userId}_video`) as HTMLVideoElement;
              const hasVideo = videoEl && videoEl.srcObject;

              return (
                <div key={participant.userId} className={styles.participantCard}>
                  {hasVideo ? (
                    <video
                      id={`display_${participant.userId}_video`}
                      autoPlay
                      playsInline
                      className={styles.participantVideo}
                      ref={(el) => {
                        if (el && videoEl && videoEl.srcObject) {
                          el.srcObject = videoEl.srcObject;
                        }
                      }}
                    />
                  ) : (
                    <div className={styles.participantInitials}>
                      {participant.initials}
                    </div>
                  )}
                  <div className={styles.participantName}>{participant.name}</div>
                </div>
              );
            })}
        </div>

        {/* Controles */}
        <div className={styles.controls}>
          <button
            onClick={() => {
              if (isMuted) {
                enableOutgoingStream();
                setIsMuted(false);
                console.log("🎤 Microphone enabled");
              } else {
                disableOutgoingStream();
                setIsMuted(true);
                console.log("🔇 Microphone disabled");
              }
            }}
            className={`${styles.controlButton} ${isMuted ? styles.muted : ""}`}
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

          <button
            onClick={() => {
              if (isVideoOff) {
                enableOutgoingVideo();
                setIsVideoOff(false);
                console.log("📹 Camera enabled");
              } else {
                disableOutgoingVideo();
                setIsVideoOff(true);
                console.log("📹 Camera disabled");
              }
            }}
            className={`${styles.controlButton} ${
              isVideoOff ? styles.videoOff : ""
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

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

      {/* Overlay para móviles cuando el chat está abierto */}
      {showChat && (
        <div 
          className={`${styles.chatOverlay} ${styles.chatOpen}`}
          onClick={() => setShowChat(false)}
        />
      )}

      {/* Sidebar de chat */}
      {showChat && (
        <div className={`${styles.chatSidebar} ${styles.chatOpen}`}>
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

      {/* Modal de resumen IA */}
      {showSummary && summary && (
        <>
          <div
            className={styles.summaryOverlay}
            onClick={() => setShowSummary(false)}
          />
          <div className={styles.summaryModal}>
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryTitle}>Resumen de la Reunión (IA)</h2>
              <button
                onClick={() => setShowSummary(false)}
                className={styles.closeSummaryButton}
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

            <div className={styles.summaryContent}>
              <div className={styles.summarySection}>
                <h3 className={styles.summarySectionTitle}>Resumen General</h3>
                <p className={styles.summaryText}>{summary.summary}</p>
              </div>

              {summary.keyPoints && summary.keyPoints.length > 0 && (
                <div className={styles.summarySection}>
                  <h3 className={styles.summarySectionTitle}>Puntos Clave</h3>
                  <ul className={styles.keyPointsList}>
                    {summary.keyPoints.map((point, index) => (
                      <li key={index} className={styles.keyPoint}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.participants && summary.participants.length > 0 && (
                <div className={styles.summarySection}>
                  <h3 className={styles.summarySectionTitle}>Participantes</h3>
                  <p className={styles.summaryText}>
                    {summary.participants.join(", ")}
                  </p>
                </div>
              )}

              <div className={styles.summaryFooter}>
                <small className={styles.summaryTimestamp}>
                  Generado el {new Date(summary.timestamp).toLocaleString('es-ES')}
                </small>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActiveMeeting;
