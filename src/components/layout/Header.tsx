import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { useEffect, useRef, useState } from "react";
import useAuthStore from "../../stores/useAuthStore";
import Alert from "../common/Alert";

/**
 * Global navigation bar that reacts to auth state and exposes
 * links, profile access and logout confirmations.
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, initAuthObserver, restoreAuthFromToken } = useAuthStore();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inicializar el observer de Firebase
    const unsubscribe = initAuthObserver();

    // Restaurar autenticación desde token si no hay usuario pero hay token
    const token = localStorage.getItem("token");
    if (token && !user) {
      restoreAuthFromToken();
    }

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Restaurar autenticación si hay token pero no usuario
    // Solo se ejecuta cuando user cambia de null a algo o viceversa
    const token = localStorage.getItem("token");
    if (token && !user) {
      restoreAuthFromToken();
    }
  }, [user]);

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

  /**
   * Opens the confirmation alert before logging out.
   */
  const handleLogout = () => {
    setShowMenu(false);
    setShowLogoutAlert(true);
  };

  /**
   * Executes the logout action after the user confirms it.
   */
  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutAlert(false);
      navigate("/");
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setShowLogoutAlert(false);
    }
  };

  /**
   * Navigates the user to the profile page and closes the dropdown.
   */
  const handleProfileClick = () => {
    setShowMenu(false);
    navigate("/profile");
  };

  /**
   * Shows or hides the user dropdown menu.
   */
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  /**
   * Generates the initials for the avatar circle using either backend or Firebase data.
   */
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`;
    }
    if (user?.displayName) {
      const names = user.displayName.split(" ");
      if (names.length >= 2) {
        return `${names[0].charAt(0).toUpperCase()}${names[1].charAt(0).toUpperCase()}`;
      }
      return user.displayName.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Logo */}
        <Link to={user || localStorage.getItem("token") ? "/meeting" : "/"} className={styles.logoLink}>
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
          {user || localStorage.getItem("token") ? (
            <div className={styles.userMenuContainer} ref={menuRef}>
              <button 
                onClick={toggleMenu} 
                className={styles.userIcon}
                aria-label="Menú de usuario"
              >
                <span>{getInitials()}</span>
              </button>
              {showMenu && (
                <div className={styles.userMenu}>
                  <button 
                    onClick={handleProfileClick}
                    className={styles.menuItem}
                  >
                    <svg 
                      className={styles.menuIcon} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                    Mi Perfil
                  </button>
                  <button 
                    onClick={handleLogout}
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  >
                    <svg 
                      className={styles.menuIcon} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.loginButton}>
                Iniciar Sesión
              </Link>
              <Link to="/register" className={styles.registerButton}>
                Crear una cuenta
              </Link>
            </>
          )}
        </div>
      </nav>

      <Alert
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        onConfirm={confirmLogout}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        type="confirm"
      />
    </header>
  );
};

export default Header;
