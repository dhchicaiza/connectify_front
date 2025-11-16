import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../../components/layout/Header";
import Alert from "../../components/common/Alert";
import styles from "./Profile.module.scss";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    email: "",
    password: "",
  });
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de guardar cambios
    console.log("Guardar cambios:", formData);
  };

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    // TODO: Implementar lógica de eliminar cuenta
    console.log("Eliminar cuenta");
    setShowDeleteAlert(false);
  };

  return (
    <div className={styles.profilePage}>
      <Header />
      
      <div className={styles.content}>
        <div className={styles.container}>
          {/* Header con flecha y avatar */}
          <div className={styles.header}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className={styles.avatar}>
              <span className={styles.avatarInitials}>LS</span>
            </div>
            <h1 className={styles.title}>Mi Perfil</h1>
          </div>

          {/* Formulario */}
          <div className={styles.formCard}>
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGrid}>
                {/* Columna Izquierda */}
                <div className={styles.formColumn}>
                  <div className={styles.formGroup}>
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Juan Pérez"
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
                    />
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className={styles.formColumn}>
                  <div className={styles.formGroup}>
                    <label>Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
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
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={handleDelete}
                  className={styles.deleteButton}
                >
                  Eliminar Cuenta
                </button>
                <button type="submit" className={styles.saveButton}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Alert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={confirmDelete}
        title="Eliminar Cuenta"
        message="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
        type="confirm"
      />
    </div>
  );
};

export default Profile;

