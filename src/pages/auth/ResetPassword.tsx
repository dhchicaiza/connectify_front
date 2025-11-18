import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import styles from "./ResetPassword.module.scss";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    console.log("Restablecer contraseña con token:", token);
    console.log("Nueva contraseña:", password);
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <div className={styles.resetPage}>
      <div className={styles.resetCard}>
        <h2 className={styles.title}>Nueva Contraseña</h2>
        <p className={styles.subtitle}>
          Ingresa tu nueva contraseña para completar la recuperación
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nueva Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitButton}>
              Restablecer Contraseña
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

