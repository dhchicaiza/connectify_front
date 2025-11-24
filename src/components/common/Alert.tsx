import { useEffect, useRef } from "react";
import styles from "./Alert.module.scss";

/**
 * Props accepted by the generic Alert component.
 */
interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string | React.ReactNode;
  type?: "confirm" | "alert" | "success";
}

/**
 * Modal-style alert used for confirmations, warnings or success feedback.
 */
const Alert: React.FC<AlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "alert",
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const alertCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus management: focus the first button when alert opens
      setTimeout(() => {
        if (type === "confirm" && cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        } else if (confirmButtonRef.current) {
          confirmButtonRef.current.focus();
        }
      }, 0);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, type]);

  /**
   * Handles keyboard navigation for accessibility (WCAG 2.1.1 - Keyboard Accessible).
   * Escape closes the alert, Enter confirms, Tab cycles through buttons.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Enter" && type === "confirm" && onConfirm) {
      e.preventDefault();
      handleConfirm();
    }
    // Tab trapping is handled by browser default behavior
  };

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-message"
      onKeyDown={handleKeyDown}
    >
      <div 
        ref={alertCardRef}
        className={`${styles.alertCard} ${type === "success" ? styles.successCard : ""}`} 
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {type === "success" && (
          <div className={styles.successIcon}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        <h3 id="alert-title" className={styles.title}>{title}</h3>
        <div id="alert-message" className={styles.message}>{message}</div>
        <div className={styles.buttonGroup}>
          {type === "confirm" ? (
            <>
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                aria-label="Cancelar la acción"
              >
                Cancelar
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirm}
                className={styles.confirmButton}
                aria-label="Confirmar la acción"
              >
                Confirmar
              </button>
            </>
          ) : (
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={onClose}
              className={type === "success" ? styles.successButton : styles.confirmButton}
              aria-label="Aceptar y cerrar el mensaje"
            >
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;

