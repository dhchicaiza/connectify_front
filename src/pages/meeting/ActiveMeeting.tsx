import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Meeting.module.scss";
import { useChat } from "./useChat";

const ActiveMeeting: React.FC = () => {
  const { id: meetingId } = useParams();
  const { messages, messageText, setMessageText, sendMessage } =
    useChat(meetingId);
  const [showChat, setShowChat] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const navigate = useNavigate();

  const handleExit = () => {
    navigate("/");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría el mensaje
    sendMessage();
  };

  const participants = [
    { initials: "LS", name: "Laura Salazar" },
    { initials: "CL", name: "Cristian Llanos" },
    { initials: "DC", name: "David Chicaiza" },
    { initials: "DG", name: "David Guerrero" },
    { initials: "JM", name: "Jhonier Mendez" },
  ];

  // const chatMessages = [
  //   { user: "Jhonier Mendez", time: "2:00", text: "Buenas tardes" },
  //   { user: "Cristian Llanos", time: "2:01", text: "Hola" },
  // ];

  return (
    <div className={styles.meetingPage}>
      {/* Header de la reunión */}
      <header className={styles.meetingHeader}>
        <h1 className={styles.meetingTitle}>Reunión de Equipo</h1>
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
        {/* Grid de participantes */}
        <div className={styles.participantsGrid}>
          {participants.map((participant, index) => (
            <div key={index} className={styles.participantCard}>
              <div className={styles.participantInitials}>
                {participant.initials}
              </div>
            </div>
          ))}
        </div>

        {/* Controles */}
        <div className={styles.controls}>
          <button
            onClick={() => setIsMuted(!isMuted)}
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
            onClick={() => setIsVideoOff(!isVideoOff)}
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

      {/* Sidebar de chat */}
      {showChat && (
        <div className={styles.chatSidebar}>
          <div className={styles.chatHeader}>
            <h2 className={styles.chatTitle}>Integrantes</h2>
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
            {messages.map((msg, index) => (
              <div key={index} className={styles.chatMessage}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageUser}>{msg.user}</span>
                  <span className={styles.messageTime}>{msg.time}</span>
                </div>
                <div className={styles.messageBubble}>{msg.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
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
