import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./ForgotPassword.module.scss";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para la carga
  const [error, setError] = useState<string | null>(null); // Nuevo estado para errores
  const [message, setMessage] = useState<string | null>(null); // Nuevo estado para mensajes de éxito
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // 1. Llamar al endpoint del backend
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // 2. Procesar la respuesta
      const result = await response.json();

      if (response.ok) {
        // Éxito (Recuerda que el backend siempre devuelve 202 para seguridad)
        // Siempre mostrar mensaje en español, independientemente de lo que devuelva el backend
        setMessage(
          "Si existe una cuenta con este correo electrónico, se ha enviado un enlace para restablecer la contraseña."
        );
         setEmail(""); 

      } else {
        // Error de validación del backend (ej: email inválido)
        setError(result.message || "Ocurrió un error al procesar la solicitud.");
      }
    } catch (err) {
      // Error de red o conexión
      console.error("Error de conexión:", err);
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <div className={styles.forgotPage}>
      <div className={styles.forgotCard}>
        <h2 className={styles.title}>Recuperar Contraseña</h2>

        {/* 💡 Mostrar mensajes de éxito o error */}
        {message && <p className={styles.successMessage}>✅ {message}</p>}
        {error && <p className={styles.errorMessage}>❌ {error}</p>}
        
        {/* Deshabilitar el formulario si hay un mensaje de éxito para evitar reenvíos */}
        <form onSubmit={handleSubmit} className={styles.form} style={{ display: message ? 'none' : 'flex' }}>
          <p className={styles.instructions}>
            Ingresa tu correo electrónico para enviarte un enlace de recuperación.
          </p>
          <div className={styles.formGroup}>
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={isLoading} // Deshabilitar durante la carga
            />
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading} // Deshabilitar durante la carga
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isLoading}
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
