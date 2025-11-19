import { auth } from "../../lib/firebase.config";
import { 
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';

import type { UserCredential as UserCredentialType } from 'firebase/auth';
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./Register.module.scss";
import Alert from "../../components/common/Alert";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const googleProvider = new GoogleAuthProvider();
// Register.tsx (dentro del componente React)



const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // 🌟 VALIDACIÓN DE EDAD: Aseguramos que sea un número válido antes de continuar
    const ageNumber = parseInt(formData.age, 10);
    if (!formData.age || isNaN(ageNumber) || ageNumber < 1) {
        setError("Por favor, introduce una edad válida (número mayor que 0).");
        return;
    }
    
    // 💡 Preparamos el payload final para enviar, incluyendo confirmPassword y age como número
    const payloadToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        age: ageNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword, 
    };
    
    setIsLoading(true);
    setError(null);
    
    console.log("JSON FINAL enviado al Backend:", payloadToSend);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 💡 Usamos el payload completo que incluye confirmPassword y age como número
        body: JSON.stringify(payloadToSend),
      });

      const result = await response.json();

      if (response.ok) {
        setShowSuccessAlert(true);
      } else {
        // Manejar errores de validación del backend o errores de servidor
        setError(result.message || "Error al registrar la cuenta. Intente de nuevo.");
      }
    } catch (err) {
      // Manejar errores de red
      setError("Error de conexión. Revise la URL de la API o la red.");
    } finally {
      setIsLoading(false);
    }
  };

const callBackendAuth = async (firebaseUser: UserCredentialType['user']) => {
    // 1. Obtener el ID Token seguro de Firebase
    const idToken = await firebaseUser.getIdToken();
    
    // 2. Preparar el payload
    const payloadToSend = {
        idToken, // Token que tu backend verificará con Firebase Admin
        // El backend usará el email y el uid del token para el login/registro
        
        // Incluir datos adicionales del perfil, si los tienes
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        email: firebaseUser.email,
    };

    // 3. Llamar a tu backend endpoint /api/auth/google
    // Aunque se llame /google, tu backend puede manejar tanto Google como Facebook
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend),
    });

    const resultFromBackend = await response.json();

    if (response.ok) {
        // Guardar el JWT propio (generado por tu backend)
        localStorage.setItem('token', resultFromBackend.token); 
        // Mostrar éxito y redirigir
        // setSuccessMessage(resultFromBackend.message);
        // navigate('/'); 
        return true; // Éxito
    } else {
        // Manejar errores del backend
        throw new Error(resultFromBackend.message || "Error del servidor al procesar el login.");
    }
};

const handleGoogleLogin = async () => {
    // 💡 Usar tu estado de carga/error
    // setIsLoading(true);
    // setError(null);
    
    try {
        // 1. Iniciar sesión con Google usando el SDK de Firebase
        const result: UserCredentialType  = await signInWithPopup(auth, googleProvider);

        // 2. Llamar al backend con el usuario de Firebase
        await callBackendAuth(result.user);
        
        // ... (Éxito y redirección) ...

    } catch (error: any) {
        // Manejar errores de Firebase (popup cerrado, token inválido)
        console.error("Error en Google Sign-In:", error);
        // setError(error.message);
    } finally {
        // setIsLoading(false);
    }
};



  return (
    <div className={styles.registerPage}>
      <div className={styles.registerCard}>
        <h2 className={styles.title}>Crear Cuenta</h2>

        {/* Mensajes de estado */}
        {error && <div className={styles.alertError}>{error}</div>}
        {successMessage && <div className={styles.alertSuccess}>{successMessage}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Primer Nombre */}
          <div className={styles.formGroup}>
            <label>Nombre</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              placeholder="Juan" 
              required 
            />
          </div>

          {/* Apellido */}
          <div className={styles.formGroup}>
            <label>Apellido</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              placeholder="Pérez" 
              required 
            />
          </div>

          {/* Correo Electrónico */}
          <div className={styles.formGroup}>
            <label>Correo Electrónico</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" required />
          </div>

          {/* Edad */}
          <div className={styles.formGroup}>
            <label>Edad</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="25" min="1" required />
          </div>

          {/* Contraseña */}
          <div className={styles.formGroup}>
            <label>Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          {/* Confirmar Contraseña */}
          <div className={styles.formGroup}>
            <label>Confirmar Contraseña</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
          </div>


          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading} // Deshabilitar mientras carga
          >
            {isLoading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerText}>O continuar con</div>
        </div>

        <div className={styles.socialButtons}>
          <button
            type="button"
            className={styles.socialButton}
            onClick={handleGoogleLogin} 
            disabled={isLoading}
          >
            <span>G</span>
            <span>Google</span>
          </button>
          <button
            type="button"
            className={styles.socialButton}
            onClick={() => handleGoogleLogin}
            disabled={isLoading}
          >
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

      <Alert
        isOpen={showSuccessAlert}
        onClose={() => {
          setShowSuccessAlert(false);
          navigate('/login');
        }}
        title="Registro Exitoso"
        message="Tu cuenta ha sido creada correctamente. Serás redirigido al inicio de sesión."
        type="success"
      />
    </div>
  );
};

export default Register;