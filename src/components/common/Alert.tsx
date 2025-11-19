import { useEffect } from "react";
import styles from "./Alert.module.scss";

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: "confirm" | "alert" | "success";
}

const Alert: React.FC<AlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "alert",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.alertCard} ${type === "success" ? styles.successCard : ""}`} onClick={(e) => e.stopPropagation()}>
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
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          {type === "confirm" ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={styles.confirmButton}
              >
                Confirmar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={type === "success" ? styles.successButton : styles.confirmButton}
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

