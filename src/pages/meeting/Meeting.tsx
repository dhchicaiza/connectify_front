import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import styles from "./Meeting.module.scss";
import { createMeeting, joinMeeting } from "../../api/meetings";
import useAuthStore from "../../stores/useAuthStore";
import Alert from "../../components/common/Alert";

/**
 * Meeting page component that allows users to create new meetings
 * or join existing ones by ID.
 * 
 * Accessibility Compliance:
 * - WCAG 2.1.1 Keyboard Accessible: Full keyboard navigation support with arrow keys, Home, End
 * - WCAG 4.1.2 Name, Role, Value (Level A): All UI components have accessible names, roles, 
 *   and values programmatically determinable. Buttons include aria-label, aria-busy, 
 *   aria-disabled, and proper type attributes. Tabs have proper roles, states, and properties.
 * - WCAG 4.1.3 Status Messages (Level AA): Status messages are presented to assistive 
 *   technologies without receiving focus via aria-live regions with role="status".
 * - WCAG 2.4.7 Focus Visible: All interactive elements have visible focus indicators
 * - WCAG 1.3.1 Info and Relationships: Semantic HTML and ARIA roles maintain structure
 * - WCAG 2.1.2 No Keyboard Trap: Focus management ensures users can navigate all controls
 */
const Meeting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"new" | "join">("new");
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoomIdAlert, setShowRoomIdAlert] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const newTabRef = useRef<HTMLButtonElement>(null);
  const joinTabRef = useRef<HTMLButtonElement>(null);
  const roomIdInputRef = useRef<HTMLInputElement>(null);
  const statusMessageRef = useRef<HTMLDivElement>(null);

  /**
   * Handles creating a new meeting and navigating to it.
   * WCAG 4.1.2 - Name, Role, Value: Ensures button state is communicated to assistive technologies.
   */
  const handleNewMeeting = async () => {
    if (!user) {
      setError("Debes iniciar sesión para crear una reunión");
      setStatusMessage("");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage("Creando reunión, por favor espera...");

    try {
      const meeting = await createMeeting();
      setCreatedRoomId(meeting.id);
      setStatusMessage("Reunión creada exitosamente");
      setShowRoomIdAlert(true);
    } catch (error: any) {
      setError(error.message || "Error al crear la reunión");
      setStatusMessage(`Error: ${error.message || "Error al crear la reunión"}`);
      setIsLoading(false);
    }
  };

  /**
   * Handles joining an existing meeting by ID.
   * WCAG 4.1.2 - Name, Role, Value: Ensures form state is communicated to assistive technologies.
   */
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomId.trim()) {
      setError("Por favor ingresa un ID de reunión");
      setStatusMessage("");
      return;
    }

    if (!user) {
      setError("Debes iniciar sesión para unirte a una reunión");
      setStatusMessage("");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage("Uniéndose a la reunión, por favor espera...");

    try {
      await joinMeeting(roomId.trim());
      setStatusMessage("Uniéndose a la reunión exitosamente");
      navigate(`/active-meeting?roomId=${roomId.trim()}`);
    } catch (error: any) {
      setError(error.message || "Error al unirse a la reunión. Verifica el ID.");
      setStatusMessage(`Error: ${error.message || "Error al unirse a la reunión. Verifica el ID."}`);
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
   * WCAG 4.1.3 - Status Messages: Provides feedback without receiving focus.
   */
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(createdRoomId);
    setStatusMessage("ID de reunión copiado al portapapeles");
    // Clear message after 3 seconds
    setTimeout(() => {
      setStatusMessage("");
    }, 3000);
  };

  /**
   * Handles keyboard navigation for tabs (Arrow keys for operable accessibility).
   * WCAG 2.1.1 - Keyboard Accessible
   */
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tab: "new" | "join") => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextTab = tab === "new" ? "join" : "new";
      setActiveTab(nextTab);
      // Focus management for keyboard navigation
      setTimeout(() => {
        if (nextTab === "new" && newTabRef.current) {
          newTabRef.current.focus();
        } else if (nextTab === "join" && joinTabRef.current) {
          joinTabRef.current.focus();
        }
      }, 0);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveTab("new");
      newTabRef.current?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveTab("join");
      joinTabRef.current?.focus();
    }
  };

  /**
   * Focus management: when switching to join tab, focus the input field.
   */
  useEffect(() => {
    if (activeTab === "join" && roomIdInputRef.current) {
      roomIdInputRef.current.focus();
    }
  }, [activeTab]);

  return (
    <div className={styles.meetingPage}>
      <Header />
      {/* WCAG 4.1.3 - Status Messages: Live region for status updates without focus */}
      <div
        ref={statusMessageRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusMessage}
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          {activeTab === "new" ? (
            <div role="tabpanel" id="new-meeting-panel" aria-labelledby="new-tab">
              <h1 className={styles.title}>¿Listo para Conectar?</h1>
              <p 
                className={styles.subtitle}
                id="new-meeting-description"
              >
                Inicia una nueva reunión en segundos
              </p>
              {error && (
                <div 
                  className={styles.errorMessage}
                  role="alert"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {error}
                </div>
              )}
              <button
                onClick={handleNewMeeting}
                className={styles.actionButton}
                disabled={isLoading}
                aria-label="Crear una nueva reunión de videoconferencia"
                aria-describedby="new-meeting-description"
                aria-busy={isLoading}
                aria-disabled={isLoading}
                type="button"
              >
                <svg
                  className={styles.cameraIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
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
            </div>
          ) : (
            <div role="tabpanel" id="join-meeting-panel" aria-labelledby="join-tab">
              <h1 className={styles.title}>Unirse a la Sala</h1>
              <p 
                className={styles.subtitle}
                id="join-meeting-description"
              >
                Ingresa el ID de la reunión
              </p>
              {error && (
                <div 
                  className={styles.errorMessage}
                  role="alert"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {error}
                </div>
              )}
              <form onSubmit={handleJoinRoom} className={styles.form}>
                <label htmlFor="room-id-input" className="sr-only">
                  ID de la reunión
                </label>
                <input
                  id="room-id-input"
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
                  ref={roomIdInputRef}
                  aria-label="Ingresa el ID de la reunión a la que deseas unirte"
                  aria-describedby="join-meeting-description room-id-help"
                  aria-invalid={error ? "true" : "false"}
                  aria-required="true"
                />
                <span id="room-id-help" className="sr-only">
                  El ID de la reunión es un código alfanumérico que te proporciona el organizador de la reunión
                </span>
                <button
                  type="submit"
                  className={styles.actionButton}
                  disabled={isLoading}
                  aria-label="Unirse a la reunión con el ID ingresado"
                  aria-busy={isLoading}
                  aria-disabled={isLoading}
                >
                  <svg
                    className={styles.cameraIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
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
            </div>
          )}

          {/* WCAG 4.1.2 - Name, Role, Value: Tabs have proper roles, states, and properties */}
          <div className={styles.tabButtons} role="tablist" aria-label="Opciones de reunión">
            <button
              ref={newTabRef}
              className={`${styles.tabButton} ${activeTab === "new" ? styles.active : ""}`}
              onClick={() => setActiveTab("new")}
              onKeyDown={(e) => handleTabKeyDown(e, "new")}
              role="tab"
              aria-selected={activeTab === "new"}
              aria-controls="new-meeting-panel"
              aria-label="Crear nueva reunión"
              id="new-tab"
              tabIndex={activeTab === "new" ? 0 : -1}
              type="button"
            >
              Nueva Reunión
            </button>
            <button
              ref={joinTabRef}
              className={`${styles.tabButton} ${activeTab === "join" ? styles.active : ""}`}
              onClick={() => setActiveTab("join")}
              onKeyDown={(e) => handleTabKeyDown(e, "join")}
              role="tab"
              aria-selected={activeTab === "join"}
              aria-controls="join-meeting-panel"
              aria-label="Unirse a una sala existente"
              id="join-tab"
              tabIndex={activeTab === "join" ? 0 : -1}
              type="button"
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
              aria-label="Copiar el ID de la reunión al portapapeles"
              type="button"
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
