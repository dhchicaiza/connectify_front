import { useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import styles from "./Landing.module.scss";

const teamMembers = [
  {
    name: "Laura Salazar",
    initials: "LS",
    role: "Product Owner",
  },
  {
    name: "Cristian Llanos",
    initials: "CL",
    role: "Frontend Developer",
  },
  {
    name: "David Chicaiza",
    initials: "DC",
    role: "Backend Developer",
  },
  {
    name: "David Guerrero",
    initials: "DG",
    role: "Backend Developer",
  },
  {
    name: "Jhonier Mendez",
    initials: "JM",
    role: "Frontend Developer",
  },
];

const Landing: React.FC = () => {
  useEffect(() => {
    // Manejar scroll cuando se carga la página con hash
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  return (
    <div className={styles.landing}>
      <Header />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>
            Conectando al Mundo
          </h1>
          <p className={styles.heroSubtitle}>
            Videoconferencias en HD, chat en tiempo real y colaboración perfecta. 
            Una plataforma potente, intuitiva y 100% segura
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className={styles.team}>
        <div className={styles.teamContainer}>
          <h2 className={styles.teamTitle}>
            Nuestro Equipo de Desarrollo
          </h2>
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.teamCard}>
                <div className={styles.teamCardContent}>
                  <div className={styles.teamAvatar}>
                    <span className={styles.teamInitials}>
                      {member.initials}
                    </span>
                  </div>
                  <div className={styles.teamInfo}>
                    <h3 className={styles.teamName}>
                      {member.name}
                    </h3>
                    <p className={styles.teamRole}>{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="footer">
        <Footer />
      </div>
    </div>
  );
};

export default Landing;

