import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import styles from "./Meeting.module.scss";
import { createMeeting, joinMeeting } from "../../api/meetings";
import useAuthStore from "../../stores/useAuthStore";
import Alert from "../../components/common/Alert";

/**
 * Meeting page component that allows users to create new meetings
 * or join existing ones by ID.
 */
const Meeting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"new" | "join">("new");
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoomIdAlert, setShowRoomIdAlert] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthStore();

  /**
   * Handles creating a new meeting and navigating to it.
   */
  const handleNewMeeting = async () => {
    if (!user) {
      setError("Debes iniciar sesión para crear una reunión");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const meeting = await createMeeting();
      setCreatedRoomId(meeting.id);
      setShowRoomIdAlert(true);
    } catch (error: any) {
      setError(error.message || "Error al crear la reunión");
      setIsLoading(false);
    }
  };

  /**
   * Handles joining an existing meeting by ID.
   */
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomId.trim()) {
      setError("Por favor ingresa un ID de reunión");
      return;
    }

    if (!user) {
      setError("Debes iniciar sesión para unirte a una reunión");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await joinMeeting(roomId.trim());
      navigate(`/active-meeting?roomId=${roomId.trim()}`);
    } catch (error: any) {
      setError(error.message || "Error al unirse a la reunión. Verifica el ID.");
      setIsLoading(false);
    }
  };

  /**
   * Handles navigating to the created meeting after showing the ID.
   */
  const handleGoToMeeting = () => {
    setShowRoomIdAlert(false);
    navigate(`/active-meeting?roomId=${createdRoomId}`);
    setIsLoading(false);
  };

  /**
   * Handles copying the room ID to clipboard.
   */
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(createdRoomId);
    // You could show a toast notification here
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
              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}
              <button
                onClick={handleNewMeeting}
                className={styles.actionButton}
                disabled={isLoading}
              >
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
                <span>{isLoading ? "Creando..." : "Nueva Reunión"}</span>
              </button>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Unirse a la Sala</h1>
              <p className={styles.subtitle}>
                Ingresa el ID de la reunión
              </p>
              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}
              <form onSubmit={handleJoinRoom} className={styles.form}>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    setError(null);
                  }}
                  placeholder="ID de la reunión"
                  className={styles.roomIdInput}
                  required
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={styles.actionButton}
                  disabled={isLoading}
                >
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
                  <span>{isLoading ? "Uniéndose..." : "Ingresar"}</span>
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

      <Alert
        isOpen={showRoomIdAlert}
        onClose={handleGoToMeeting}
        onConfirm={handleGoToMeeting}
        title="Reunión Creada"
        message={
          <div>
            <p>Tu reunión ha sido creada exitosamente.</p>
            <p style={{ marginTop: "10px", fontWeight: "bold", wordBreak: "break-all" }}>
              ID de la reunión: {createdRoomId}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyRoomId();
              }}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Copiar ID
            </button>
            <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#666" }}>
              Comparte este ID con los participantes.
            </p>
          </div>
        }
        type="success"
      />
    </div>
  );
};

export default Meeting;
