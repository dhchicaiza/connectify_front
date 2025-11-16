import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./ForgotPassword.module.scss";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de recuperación
    console.log("Recuperar contraseña para:", email);
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <div className={styles.forgotPage}>
      <div className={styles.forgotCard}>
        <h2 className={styles.title}>Recuperar Contraseña</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitButton}>
              Enviar
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

export default ForgotPassword;

