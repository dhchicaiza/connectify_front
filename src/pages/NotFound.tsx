import { Link, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import styles from "./NotFound.module.scss";

/**
 * 404 Not Found page component.
 * Displays when a user navigates to a route that doesn't exist.
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.notFoundPage}>
      <Header />
      <div className={styles.content}>
        <div className={styles.container}>
          <h1 className={styles.title}>404</h1>
          <h2 className={styles.subtitle}>Página no encontrada</h2>
          <p className={styles.message}>
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <div className={styles.actions}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              Volver
            </button>
            <Link to="/" className={styles.homeButton}>
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

