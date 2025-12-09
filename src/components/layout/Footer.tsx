import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";

/**
 * Application footer containing quick navigation links for
 * account management, company info, meeting actions, and help.
 */
const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Cuenta */}
          <div className={styles.column}>
            <h3>Cuenta</h3>
            <ul>
              <li>
                <Link to="/login" className={styles.link}>
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/register" className={styles.link}>
                  Crear Cuenta
                </Link>
              </li>
              <li>
                <Link to="/profile" className={styles.link}>
                  Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div className={styles.column}>
            <h3>Empresa</h3>
            <ul>
              <li>
                <Link to="/" className={styles.link}>
                  Inicio
                </Link>
              </li>
              <li>
                <a
                  href="/#team"
                  className={styles.link}
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.location.pathname === "/") {
                      const element = document.getElementById("team");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    } else {
                      window.location.href = "/#team";
                    }
                  }}
                >
                  Sobre Nosotros
                </a>
              </li>
            </ul>
          </div>

          {/* Reunión */}
          <div className={styles.column}>
            <h3>Reunión</h3>
            <ul>
              <li>
                <Link to="/meeting" className={styles.link}>
                  Crear Sala
                </Link>
              </li>
              <li>
                <Link to="/meeting" className={styles.link}>
                  Unirse a Sala
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div className={styles.column}>
            <h3>Ayuda</h3>
            <ul>
              <li>
                <Link to="/manual" className={styles.link}>
                  Manual de Usuario
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

