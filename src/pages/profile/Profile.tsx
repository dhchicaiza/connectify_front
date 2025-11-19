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
  currentPassword: string;
  password: string; 
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  age: "",
  email: "",
  currentPassword: "",
  password: "",
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore(); 
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
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
        currentPassword: "",
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
    
    // Construir el objeto de datos a enviar
    const dataToSend: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    };

    // Incluir edad solo si tiene valor
    if (formData.age && formData.age.trim() !== "") {
      dataToSend.age = Number(formData.age);
    }


    if (formData.password && formData.password.trim() !== "") {
      if (!formData.currentPassword || formData.currentPassword.trim() === "") {
        setSaveMessage("Debes ingresar tu contraseña actual para cambiar la contraseña");
        setIsSaving(false);
        setTimeout(() => setSaveMessage(null), 4000);
        return;
      }
      dataToSend.password = formData.password;
      dataToSend.currentPassword = formData.currentPassword;
    }

    try {
      const response = await fetchUpdateUser(dataToSend);
      
      if (response.data.user) {
        setUser(response.data.user); 
      }
      
      // Limpiar las contraseñas después de guardar exitosamente
      setFormData(prev => ({ ...prev, currentPassword: "", password: "" }));
      setIsSaving(false);
      setShowSuccessAlert(true);

    } catch (error: any) {
      console.error("Error al guardar cambios:", error);
      const message = error.message || "Error al guardar cambios. Por favor, verifica tus datos.";
      setSaveMessage(message);
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
      
      // Cerrar la alerta de confirmación
      setShowDeleteAlert(false);
      
      // Mostrar alerta de éxito
      setShowDeleteSuccessAlert(true);
    } catch (error) {
      console.error('Error deleting account:', error);
      setShowDeleteAlert(false);
      setSaveMessage('Error al eliminar la cuenta. Inténtalo de nuevo.');
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const handleDeleteSuccessClose = () => {
    setShowDeleteSuccessAlert(false);
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
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
                    <label>Contraseña Actual</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                    
                  </div>

                  <div className={styles.formGroup}>
                    <label>Nueva Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                    <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                      Deja vacío si no deseas cambiar la contraseña
                    </small>
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

      <Alert
        isOpen={showSuccessAlert}
        onClose={() => {
          setShowSuccessAlert(false);
          setIsSaving(false);
        }}
        title="Perfil Actualizado"
        message="Tus cambios han sido guardados exitosamente."
        type="success"
      />

      <Alert
        isOpen={showDeleteSuccessAlert}
        onClose={handleDeleteSuccessClose}
        title="Cuenta Eliminada"
        message="Tu cuenta ha sido eliminada exitosamente. Serás redirigido a la página principal."
        type="success"
      />
    </div>
  );
};

export default Profile;
