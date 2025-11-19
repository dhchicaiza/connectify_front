import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Alert from "../../components/common/Alert";
import styles from "./Profile.module.scss";
import { fetchDeleteUser, fetchUpdateUser } from "../../api/user"; 
import useAuthStore from "../../stores/useAuthStore";

interface FormData {
  firstName: string;
  lastName: string;
  age: string;
  email: string;
  password: string; 
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  age: "",
  email: "",
  password: "",
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore(); 
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const [saveMessage, setSaveMessage] = useState<string | null>(null); 

  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        age: user.age ? String(user.age) : '', 
        email: user.email || '',
        password: "", 
      }));
    } else {
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    setIsSaving(true);
    
    const dataToSend = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      ...(formData.age && { age: Number(formData.age) }),
      email: formData.email,
      ...(formData.password && { password: formData.password }),
    };

    try {
      const response = await fetchUpdateUser(dataToSend);
      
      if (response.data.user) {
        setUser(response.data.user); 
      }
      
      setSaveMessage("Cambios guardados exitosamente. 🎉");
      
      setFormData(prev => ({ ...prev, password: "" }));

    } catch (error: any) {
      console.error("Error al guardar cambios:", error);
      const message = error.message || "Error al guardar cambios. Por favor, verifica tus datos.";
      setSaveMessage(message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000); 
    }
  };

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      await fetchDeleteUser();

      setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Error al eliminar la cuenta. Inténtalo de nuevo.');
    }

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
              <span className={styles.avatarInitials}>
                {formData.firstName.charAt(0).toUpperCase()}{formData.lastName.charAt(0).toUpperCase()} 
              </span>
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
                    <label>Nombre</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Juan"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Apellido</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Pérez"
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
                      placeholder="•••••••• (dejar vacío para no cambiar)"
                    />
                  </div>
                </div>
              </div>

              {/* Botones y Mensajes de Estado */}
              <div className={styles.buttonGroup}>
                {saveMessage && (
                  <p style={{ 
                    color: saveMessage.includes("Error") ? 'var(--color-danger)' : 'var(--color-success)',
                    fontWeight: 'bold',
                    alignSelf: 'center',
                  }}>
                    {saveMessage}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  className={styles.deleteButton}
                  disabled={isSaving}
                >
                  Eliminar Cuenta
                </button>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
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