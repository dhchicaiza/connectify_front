import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import styles from "./ResetPassword.module.scss";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null); 

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();


    if (!token) {
        return (
            <div className={styles.resetPage}>
                <div className={styles.resetCard}>
                    <h2 className={styles.title}>Error de Enlace</h2>
                    <p className={styles.errorMessage}>
                        ❌ Token de restablecimiento no encontrado. Por favor, solicita un nuevo enlace.
                    </p>
                    <button 
                        onClick={() => navigate('/forgot-password')} 
                        className={styles.submitButton}
                    >
                        Solicitar nuevo enlace
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                token: token, // El token obtenido de la URL
                password: password,
                confirmPassword: confirmPassword,
            };

            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(result.message || "Contraseña restablecida exitosamente. Serás redirigido...");
                
                setTimeout(() => {
                    navigate("/login");
                }, 3000);

            } else {
                setError(result.message || "Error al restablecer. Verifica el enlace o la contraseña.");
            }
        } catch (err) {
            console.error("Error de conexión:", err);
            setError("No se pudo conectar con el servidor.");
        } finally {
            setIsLoading(false);
        }
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

                {message && <p className={styles.successMessage}>✅ {message}</p>}
                {error && <p className={styles.errorMessage}>❌ {error}</p>}
                
                {!message && (
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
                                disabled={isLoading} 
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
                                disabled={isLoading} 
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            <button 
                                type="submit" 
                                className={styles.submitButton}
                                disabled={isLoading} 
                            >
                                {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
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
                )}
            </div>
        </div>
    );
};

export default ResetPassword;