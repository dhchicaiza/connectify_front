import { useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import styles from "./Manual.module.scss";

/**
 * Manual section configuration interface.
 * 
 * @interface SectionConfig
 * @property {string} id - Unique identifier for the section (used as anchor)
 * @property {string} title - Display title of the section
 */
interface SectionConfig {
  id: string;
  title: string;
}

/**
 * User manual page component for the Connectify platform.
 * 
 * Provides comprehensive documentation about all application features including:
 * - User registration and authentication
 * - Meeting creation and joining
 * - Video and audio controls
 * - Real-time chat functionality
 * - Profile management
 * - Accessibility features
 * - Frequently asked questions
 * 
 * @component
 * @returns {JSX.Element} The rendered user manual page
 * 
 * @example
 * ```tsx
 * <Manual />
 * ```
 * 
 * @remarks
 * - Uses smooth scrolling for section navigation
 * - Includes sidebar navigation with active section highlighting
 * - Fully responsive design for mobile and desktop
 * - Follows WCAG 2.1 accessibility standards
 * 
 * @author Connectify Team
 * @since 1.0.0
 */
const Manual: React.FC = () => {
  /**
   * Currently active section identifier for navigation highlighting.
   * 
   * @type {string}
   */
  const [activeSection, setActiveSection] = useState<string>("introduccion");

  /**
   * Array of manual sections with their identifiers and titles.
   * Used to generate the navigation sidebar and section anchors.
   * 
   * @type {SectionConfig[]}
   * @constant
   */
  const sections: SectionConfig[] = [
    { id: "introduccion", title: "Introducción" },
    { id: "requisitos", title: "Requisitos del Sistema" },
    { id: "registro", title: "Registro e Inicio de Sesión" },
    { id: "navegacion", title: "Navegación" },
    { id: "reuniones", title: "Reuniones" },
    { id: "controles", title: "Controles de Video y Audio" },
    { id: "chat", title: "Chat en Tiempo Real" },
    { id: "perfil", title: "Gestión de Perfil" },
    { id: "accesibilidad", title: "Accesibilidad" },
    { id: "faq", title: "Preguntas Frecuentes" },
  ];

  /**
   * Handles navigation to a specific section.
   * Updates the active section state and scrolls smoothly to the target element.
   * 
   * @function handleSectionNavigation
   * @param {string} sectionId - The identifier of the section to navigate to
   * @returns {void}
   */
  const handleSectionNavigation = (sectionId: string): void => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={styles.manualPage}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Índice</h2>
          <nav className={styles.nav}>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionNavigation(section.id)}
                className={`${styles.navItem} ${activeSection === section.id ? styles.active : ""}`}
                aria-label={`Ir a la sección ${section.title}`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.mainTitle}>Manual de Usuario</h1>
            <p className={styles.subtitle}>
              Guía completa para utilizar la plataforma Connectify de videoconferencias
            </p>
          </header>

          {/* Introduction Section */}
          <section id="introduccion" className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Introducción</h2>
            <div className={styles.sectionContent}>
              <p>
                <strong>Connectify</strong> es una plataforma web de videoconferencias diseñada 
                para facilitar la comunicación y colaboración en tiempo real. Esta aplicación 
                permite crear y unirse a reuniones virtuales con transmisión de video y audio 
                en alta calidad, chat en tiempo real, y una interfaz intuitiva y accesible.
              </p>
              <h3>Características Principales</h3>
              <ul>
                <li>✅ Videoconferencias en tiempo real con hasta 10 participantes</li>
                <li>✅ Chat en tiempo real durante las reuniones</li>
                <li>✅ Controles de video y audio (activar/desactivar cámara y micrófono)</li>
                <li>✅ Autenticación segura con múltiples métodos (email/password, OAuth)</li>
                <li>✅ Interfaz responsiva y accesible</li>
                <li>✅ Gestión completa de perfil de usuario</li>
              </ul>
            </div>
          </section>

          {/* System Requirements Section */}
          <section id="requisitos" className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Requisitos del Sistema</h2>
            <div className={styles.sectionContent}>
              <h3>Navegadores Compatibles</h3>
              <ul>
                <li>Google Chrome (versión 90 o superior)</li>
                <li>Mozilla Firefox (versión 88 o superior)</li>
                <li>Microsoft Edge (versión 90 o superior)</li>
                <li>Safari (versión 14 o superior)</li>
              </ul>
              <h3>Requisitos de Hardware</h3>
              <ul>
                <li>Cámara web (opcional, para video)</li>
                <li>Micrófono (opcional, para audio)</li>
                <li>Conexión a Internet estable (mínimo 1 Mbps para video)</li>
                <li>Altavoces o auriculares</li>
              </ul>
              <h3>Permisos Necesarios</h3>
              <p>
                La aplicación solicitará permisos para acceder a tu cámara y micrófono 
                cuando te unas a una reunión. Puedes denegar estos permisos y usar solo 
                el chat, o activarlos más tarde desde los controles de la reunión.
              </p>
            </div>
          </section>

          {/* Registration and Login Section */}
          <section id="registro" className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Registro e Inicio de Sesión</h2>
            <div className={styles.sectionContent}>
              <h3>Crear una Cuenta</h3>
              <ol>
                <li>Navega a la página de <strong>Registro</strong> desde el menú superior o el footer.</li>
                <li>Completa el formulario con la siguiente información:
                  <ul>
                    <li><strong>Nombre:</strong> Tu nombre de pila</li>
                    <li><strong>Apellido:</strong> Tu apellido</li>
                    <li><strong>Edad:</strong> Debe ser mayor o igual a 13 años</li>
                    <li><strong>Email:</strong> Tu dirección de correo electrónico válida</li>
                    <li><strong>Contraseña:</strong> Mínimo 8 caracteres, debe incluir:
                      <ul>
                        <li>Al menos una letra mayúscula</li>
                        <li>Al menos un número</li>
                        <li>Al menos un carácter especial</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>Haz clic en <strong>"Registrarse"</strong> para crear tu cuenta.</li>
              </ol>

              <h3>Iniciar Sesión</h3>
              <ol>
                <li>Ve a la página de <strong>Iniciar Sesión</strong>.</li>
                <li>Ingresa tu email y contraseña.</li>
                <li>Haz clic en <strong>"Iniciar Sesión"</strong>.</li>
              </ol>

              <h3>Inicio de Sesión con OAuth</h3>
              <p>
                También puedes iniciar sesión usando tu cuenta de <strong>Google</strong> o 
                <strong>Facebook</strong> haciendo clic en los botones correspondientes en la 
                página de inicio de sesión.
              </p>

              <h3>Recuperar Contraseña</h3>
              <ol>
                <li>En la página de inicio de sesión, haz clic en <strong>"¿Olvidaste tu contraseña?"</strong></li>
                <li>Ingresa tu dirección de correo electrónico.</li>
                <li>Recibirás un email con un enlace para restablecer tu contraseña.</li>
                <li>El enlace es válido por 1 hora y solo puede usarse una vez.</li>
                <li>Sigue las instrucciones en el email para crear una nueva contraseña.</li>
              </ol>
            </div>
          </section>

          {/* Navigation Section */}
          <section id="navegacion" className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Navegación</h2>
            <div className={styles.sectionContent}>
              <h3>Menú Principal</h3>
              <p>
                El menú superior de la aplicación contiene las siguientes opciones:
              </p>
              <ul>
                <li><strong>Inicio:</strong> Página principal con información sobre la plataforma</li>
                <li><strong>Reuniones:</strong> Acceso a crear o unirse a reuniones</li>
                <li><strong>Perfil:</strong> Gestión de tu información personal (requiere inicio de sesión)</li>
                <li><strong>Iniciar Sesión / Registrarse:</strong> Acceso a autenticación</li>
              </ul>

              <h3>Footer</h3>
              <p>
                El pie de página contiene enlaces rápidos organizados en categorías:
              </p>
              <ul>
                <li><strong>Cuenta:</strong> Iniciar Sesión, Crear Cuenta, Perfil</li>
                <li><strong>Empresa:</strong> Inicio, Sobre Nosotros</li>
                <li><strong>Reunión:</strong> Crear Sala, Unirse a Sala</li>
                <li><strong>Ayuda:</strong> Manual de Usuario (esta página)</li>
              </ul>
            </div>
          </section>

          {/* Meetings Section */}
          <section id="reuniones" className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Reuniones</h2>
            <div className={styles.sectionContent}>
              <h3>Crear una Nueva Reunión</h3>
              <ol>
                <li>Inicia sesión en tu cuenta.</li>
                <li>Navega a la página de <strong>Reuniones</strong> desde el menú.</li>
                <li>Selecciona la pestaña <strong>"Nueva Reunión"</strong>.</li>
                <li>Haz clic en el botón <strong>"Nueva Reunión"</strong>.</li>
                <li>Se generará un ID único para tu reunión.</li>
                <li>Puedes copiar el ID y compartirlo con los participantes.</li>
                <li>Haz clic en <strong>"Ir a la Reunión"</strong> para comenzar.</li>
              </ol>

              <h3>Unirse a una Reunión Existente</h3>
              <ol>
                <li>Inicia sesión en tu cuenta.</li>
                <li>Ve a la página de <strong>Reuniones</strong>.</li>
                <li>Selecciona la pestaña <strong>"Unirse a Sala"</strong>.</li>
                <li>Ingresa el <strong>ID de la reunión</strong> que te proporcionó el organizador.</li>
                <li>Haz clic en <strong>"Ingresar"</strong>.</li>
                <li>Serás redirigido a la sala de reunión.</li>
              </ol>

              <h3>Durante la Reunión</h3>
              <ul>
                <li>Tu video aparecerá en la parte superior izquierda del grid de participantes.</li>
                <li>Los videos de otros participantes aparecerán en el grid.</li>
                <li>Si un participante tiene la cámara apagada, verás su avatar con sus iniciales.</li>
                <li>El nombre de cada participante aparece debajo de su video.</li>
                <li>Un indicador muestra si estás hablando (detección de voz).</li>
              </ul>
            </div>
          </section>

          {/* Video and Audio Controls Section */}
          <section id="controles" className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Controles de Video y Audio</h2>
            <div className={styles.sectionContent}>
              <h3>Barra de Controles</h3>
              <p>
                En la parte inferior de la pantalla durante una reunión, encontrarás 
                una barra de controles con tres botones principales:
              </p>

              <div className={styles.controlItem}>
                <h4>🎤 Botón de Micrófono</h4>
                <ul>
                  <li><strong>Activar/Desactivar:</strong> Haz clic para silenciar o activar tu micrófono.</li>
                  <li><strong>Estado visual:</strong> El botón cambia de apariencia cuando está silenciado.</li>
                  <li><strong>Indicador:</strong> Un ícono 🔇 aparece junto a tu nombre cuando estás silenciado.</li>
                </ul>
              </div>

              <div className={styles.controlItem}>
                <h4>📹 Botón de Cámara</h4>
                <ul>
                  <li><strong>Activar/Desactivar:</strong> Haz clic para encender o apagar tu cámara.</li>
                  <li><strong>Estado visual:</strong> El botón cambia cuando la cámara está apagada.</li>
                  <li><strong>Vista:</strong> Cuando la cámara está apagada, se muestra tu avatar con iniciales.</li>
                </ul>
              </div>

              <div className={styles.controlItem}>
                <h4>💬 Botón de Chat</h4>
                <ul>
                  <li><strong>Mostrar/Ocultar:</strong> Haz clic para abrir o cerrar el panel de chat.</li>
                  <li><strong>Panel lateral:</strong> El chat aparece en el lado derecho de la pantalla.</li>
                  <li><strong>Estado de conexión:</strong> Un indicador muestra si el chat está conectado.</li>
                </ul>
              </div>

              <h3>Permisos de Cámara y Micrófono</h3>
              <p>
                Cuando te unes a una reunión por primera vez, el navegador te pedirá 
                permiso para acceder a tu cámara y micrófono. Puedes:
              </p>
              <ul>
                <li><strong>Permitir:</strong> Acceso completo a cámara y micrófono.</li>
                <li><strong>Bloquear:</strong> Solo podrás usar el chat (puedes activar después desde los controles).</li>
                <li><strong>Permitir solo audio:</strong> Si bloqueas la cámara pero permites el micrófono.</li>
              </ul>
            </div>
          </section>

          {/* Chat Section */}
          <section id="chat" className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Chat en Tiempo Real</h2>
            <div className={styles.sectionContent}>
              <h3>Usar el Chat</h3>
              <ol>
                <li>Haz clic en el botón de <strong>Chat</strong> en la barra de controles.</li>
                <li>Se abrirá un panel lateral a la derecha.</li>
                <li>Escribe tu mensaje en el campo de texto en la parte inferior.</li>
                <li>Presiona <strong>Enter</strong> o haz clic en el botón de envío.</li>
                <li>Tu mensaje aparecerá junto con tu nombre y la hora.</li>
              </ol>

              <h3>Características del Chat</h3>
              <ul>
                <li><strong>Tiempo real:</strong> Los mensajes se envían y reciben instantáneamente.</li>
                <li><strong>Historial:</strong> Puedes ver todos los mensajes de la reunión.</li>
                <li><strong>Identificación:</strong> Cada mensaje muestra el nombre del remitente.</li>
                <li><strong>Hora:</strong> Cada mensaje incluye la hora de envío.</li>
                <li><strong>Auto-scroll:</strong> El chat se desplaza automáticamente a los nuevos mensajes.</li>
              </ul>

              <h3>Estado de Conexión</h3>
              <p>
                En la parte superior del panel de chat, verás un indicador de estado:
              </p>
              <ul>
                <li><strong>● Conectado</strong> (verde): El chat está funcionando correctamente.</li>
                <li><strong>● Desconectado</strong> (rojo): Hay un problema con la conexión.</li>
              </ul>
            </div>
          </section>

          {/* Profile Management Section */}
          <section id="perfil" className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Gestión de Perfil</h2>
            <div className={styles.sectionContent}>
              <h3>Acceder a tu Perfil</h3>
              <p>
                Haz clic en <strong>"Perfil"</strong> en el menú superior (requiere inicio de sesión).
              </p>

              <h3>Editar Información Personal</h3>
              <p>Puedes actualizar los siguientes campos:</p>
              <ul>
                <li><strong>Nombre:</strong> Tu nombre de pila</li>
                <li><strong>Apellido:</strong> Tu apellido</li>
                <li><strong>Edad:</strong> Tu edad</li>
                <li><strong>Correo Electrónico:</strong> Tu dirección de email</li>
              </ul>

              <h3>Cambiar Contraseña</h3>
              <ol>
                <li>En la página de perfil, completa el campo <strong>"Contraseña Actual"</strong>.</li>
                <li>Ingresa tu <strong>"Nueva Contraseña"</strong> (debe cumplir los mismos requisitos que al registrarse).</li>
                <li>Si no deseas cambiar la contraseña, deja estos campos vacíos.</li>
                <li>Haz clic en <strong>"Guardar Cambios"</strong>.</li>
              </ol>

              <h3>Eliminar Cuenta</h3>
              <ol>
                <li>En la página de perfil, haz clic en <strong>"Eliminar Cuenta"</strong>.</li>
                <li>Confirma la acción en el diálogo que aparece.</li>
                <li><strong>Advertencia:</strong> Esta acción no se puede deshacer y eliminará todos tus datos.</li>
                <li>Serás redirigido a la página principal después de eliminar la cuenta.</li>
              </ol>
            </div>
          </section>

          {/* Accessibility Section */}
          <section id="accesibilidad" className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Accesibilidad</h2>
            <div className={styles.sectionContent}>
              <p>
                Connectify está diseñado siguiendo los estándares de accesibilidad web 
                (WCAG 2.1) para garantizar que todos los usuarios puedan utilizar la plataforma.
              </p>

              <h3>Navegación por Teclado</h3>
              <ul>
                <li><strong>Tab:</strong> Navegar entre elementos interactivos</li>
                <li><strong>Enter/Space:</strong> Activar botones y enlaces</li>
                <li><strong>Flechas:</strong> Navegar entre pestañas y opciones</li>
                <li><strong>Escape:</strong> Cerrar diálogos y modales</li>
              </ul>

              <h3>Lectores de Pantalla</h3>
              <p>
                La aplicación incluye etiquetas ARIA y descripciones para lectores de pantalla, 
                permitiendo que usuarios con discapacidad visual naveguen y utilicen todas las funcionalidades.
              </p>

              <h3>Contraste y Colores</h3>
              <p>
                Los colores y contrastes cumplen con los estándares WCAG para garantizar 
                legibilidad para usuarios con diferentes tipos de visión.
              </p>

              <h3>Texto Alternativo</h3>
              <p>
                Todas las imágenes e íconos incluyen descripciones alternativas para 
                usuarios que utilizan lectores de pantalla.
              </p>
            </div>
          </section>

          {/* Frequently Asked Questions Section */}
          <section id="faq" className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Preguntas Frecuentes</h2>
            <div className={styles.sectionContent}>
              <div className={styles.faqItem}>
                <h3>¿Cuántos participantes pueden estar en una reunión?</h3>
                <p>
                  La plataforma soporta entre 2 y 10 participantes simultáneos en una reunión.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h3>¿Puedo usar la aplicación sin cámara o micrófono?</h3>
                <p>
                  Sí, puedes unirte a una reunión y usar solo el chat. Puedes activar 
                  la cámara y el micrófono en cualquier momento desde los controles.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h3>¿Cómo comparto el ID de mi reunión?</h3>
                <p>
                  Después de crear una reunión, puedes copiar el ID usando el botón 
                  "Copiar ID" y compartirlo por email, mensaje, o cualquier otro medio.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h3>¿Los datos de la reunión se guardan?</h3>
                <p>
                  La información de la reunión (participantes, chat) se almacena en 
                  la base de datos. Los videos y audios no se graban ni almacenan.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h3>¿Qué hago si no puedo escuchar o ver a otros participantes?</h3>
                <p>
                  Verifica que:
                  <ul>
                    <li>Tu conexión a Internet sea estable</li>
                    <li>Los permisos de cámara/micrófono estén habilitados</li>
                    <li>El volumen de tu dispositivo esté activado</li>
                    <li>Intenta refrescar la página o salir y volver a entrar a la reunión</li>
                  </ul>
                </p>
              </div>

              <div className={styles.faqItem}>
                <h3>¿Puedo cambiar mi email después de registrarme?</h3>
                <p>
                  Sí, puedes actualizar tu email desde la página de perfil. 
                  Si el nuevo email ya está en uso, recibirás un error.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h3>¿La aplicación funciona en dispositivos móviles?</h3>
                <p>
                  Sí, la aplicación es responsiva y funciona en tablets y smartphones. 
                  Sin embargo, para la mejor experiencia, se recomienda usar una computadora 
                  de escritorio o laptop.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h3>¿Qué navegadores son compatibles?</h3>
                <p>
                  La aplicación funciona mejor en Chrome, Firefox, Edge y Safari 
                  (versiones recientes). Se recomienda mantener el navegador actualizado.
                </p>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Soporte</h2>
            <div className={styles.sectionContent}>
              <p>
                Si tienes más preguntas o necesitas ayuda adicional, puedes:
              </p>
              <ul>
                <li>Revisar este manual completo</li>
                <li>Verificar la sección de Preguntas Frecuentes</li>
                <li>Contactar al equipo de desarrollo a través de la página "Sobre Nosotros"</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Manual;

