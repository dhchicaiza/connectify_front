import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import styles from "./Meeting.module.scss";

const Meeting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"new" | "join">("new");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleNewMeeting = () => {
    console.log("Crear nueva reunión");
    navigate("/home");
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomId.trim()) {
      alert("Por favor ingresa un ID de reunión");
      return;
    }

    console.log("Unirse a la sala:", roomId);
    navigate("/home");
  };

  return (
    <div className={styles.meetingPage}>
      <Header />
      <div className={styles.content}>
        <div className={styles.card}>
          {activeTab === "new" ? (
            <>
              <h1 className={styles.title}>¿Listo para Conectar?</h1>
              <p className={styles.subtitle}>
                Inicia una nueva reunión en segundos
              </p>
              <button onClick={handleNewMeeting} className={styles.actionButton}>
                <svg
                  className={styles.cameraIcon}
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
                <span>Nueva Reunión</span>
              </button>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Unirse a la Sala</h1>
              <p className={styles.subtitle}>
                Ingresa el ID de la reunión
              </p>
              <form onSubmit={handleJoinRoom} className={styles.form}>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="ID de la reunión"
                  className={styles.roomIdInput}
                  required
                />
                <button type="submit" className={styles.actionButton}>
                  <svg
                    className={styles.cameraIcon}
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
                  <span>Ingresar</span>
                </button>
              </form>
            </>
          )}

          <div className={styles.tabButtons}>
            <button
              className={`${styles.tabButton} ${activeTab === "new" ? styles.active : ""}`}
              onClick={() => setActiveTab("new")}
            >
              Nueva Reunión
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "join" ? styles.active : ""}`}
              onClick={() => setActiveTab("join")}
            >
              Unirse a Sala
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Meeting;

