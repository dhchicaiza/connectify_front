import { useEffect } from "react";
import styles from "./Alert.module.scss";

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: "confirm" | "alert";
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
      <div className={styles.alertCard} onClick={(e) => e.stopPropagation()}>
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
              className={styles.confirmButton}
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

