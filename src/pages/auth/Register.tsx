import { Link } from "react-router-dom";
import { useState } from "react";
import styles from "./Register.module.scss";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de registro
    console.log("Registro:", formData);
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerCard}>
        <h2 className={styles.title}>Crear Cuenta</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nombre Completo</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Edad</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="25"
              min="1"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Crear Cuenta
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerText}>O continuar con</div>
        </div>

        <div className={styles.socialButtons}>
          <button type="button" className={styles.socialButton}>
            <span>G</span>
            <span>Google</span>
          </button>
          <button type="button" className={styles.socialButton}>
            <span>f</span>
            <span>Facebook</span>
          </button>
        </div>

        <div className={styles.loginSection}>
          <p>¿Ya tienes una cuenta?</p>
          <Link to="/login" className={styles.loginButton}>
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

