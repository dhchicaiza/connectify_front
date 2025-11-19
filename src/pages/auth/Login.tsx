import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./Login.module.scss";
import { fetchLoginUser } from "../../api/auth";
import useAuthStore from "../../stores/useAuthStore";
import { ButtonGoogle } from "../../components/common/ButtonGoogle";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { user, setUser, initAuthObserver } = useAuthStore();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await fetchLoginUser(email, password);

      if (data.data.token) {
        localStorage.setItem("token", data.data.token);
        setUser(data.data.user);
      }

      navigate("/userhome");
    } catch (error: any) {
      setErrorMessage("No se pudo iniciar sesión. Verifica tus datos.");
    }
  };

  useEffect(() => {
    const unsub = initAuthObserver();
    return () => unsub();
  }, [initAuthObserver]);

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoGradient}></div>
            <div className={styles.logoCircle}>
              <svg
                className={styles.logoIcon}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <div className={styles.logoDot}></div>
          </div>
          <span className={styles.logoText}>CONNECTIFY</span>
        </div>

        <Link to="/" className={styles.backButton}>
          Volver al inicio
        </Link>

        <h2 className={styles.title}>Bienvenido</h2>

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

          <div className={styles.formGroup}>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error message */}
          {errorMessage && (
            <div>
              <p>{errorMessage}</p>
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            Iniciar Sesión
          </button>
        </form>

        <div className={styles.forgotLink}>
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        </div>

        <div className={styles.divider}>
          <div className={styles.dividerText}>O continuar con</div>
        </div>

        <div className={styles.socialButtons}>
          <ButtonGoogle setErrorMessage={setErrorMessage} />

          <button type="button" className={styles.socialButton}>
            <span>f</span>
            <span>Facebook</span>
          </button>
        </div>

        <div className={styles.registerSection}>
          <p>¿No tienes cuenta?</p>
          <Link to="/register" className={styles.registerButton}>
            Crear una Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
