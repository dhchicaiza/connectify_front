import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { useEffect, useRef, useState } from "react";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/home");
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Logo */}
        <Link to="/" className={styles.logoLink}>
          <div className={styles.logoContainer}>
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
        </Link>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>
            Inicio
          </Link>
          <a
            href="/#team"
            className={styles.navLink}
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
          <a
            href="/#footer"
            className={styles.navLink}
            onClick={(e) => {
              e.preventDefault();
              if (window.location.pathname === "/") {
                const element = document.getElementById("footer");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              } else {
                window.location.href = "/#footer";
              }
            }}
          >
            Mapa del Sitio
          </a>
        </div>

        {/* Auth Buttons or User Icon */}
        <div className={styles.authButtons}>
          {/* TODO: Mostrar userIcon cuando el usuario esté autenticado */}
          {/* Por ahora, mostrar ambos para que funcione en todas las páginas */}
          <Link to="/profile" className={styles.userIcon}>
            <span>LS</span>
          </Link>
          <Link to="/login" className={styles.loginButton}>
            Iniciar Sesión
          </Link>
          <Link to="/register" className={styles.registerButton}>
            Crear una cuenta
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
