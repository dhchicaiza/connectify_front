import { create } from "zustand";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.config";
import { fetchLoginUserGoogle } from "../api/auth";

// ⭐️ Interfaz User Extendida
// Incluye las propiedades de Firebase (email, displayName) y las propiedades del Backend (firstName, lastName, age).
// Las propiedades del backend son opcionales (?) porque pueden no estar disponibles inmediatamente (ej. después de initAuthObserver).
interface User {
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  
  // Propiedades del perfil para el backend
  firstName?: string; // ⬅️ Añadido para el perfil
  lastName?: string;  // ⬅️ Añadido para el perfil
  age?: number;       // ⬅️ Añadido para el perfil
}

type AuthStore = {
  user: User | null;
  setUser: (user: User) => void;
  initAuthObserver: () => () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  // setUser ahora acepta la interfaz extendida 'User'
  setUser: (user: User) => set({ user }),

  initAuthObserver: () => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser) => {
        if (fbUser) {
          // Cuando Firebase se inicializa, solo tenemos los datos básicos.
          const userLogged: User = {
            displayName: fbUser.displayName,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            // Las propiedades de perfil (firstName, etc.) quedan undefined
          };
          set({ user: userLogged });
        } else {
          set({ user: null });
          localStorage.removeItem("token");
        }
      },
      (err) => {
        console.error(err);
      }
    );
    return unsubscribe;
  },

  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const firebaseUser = result.user;
      const googleIdToken = await firebaseUser.getIdToken();

      const backendResponse = await fetchLoginUserGoogle(googleIdToken);
      
      // Asumo que backendResponse.user contiene firstName, lastName, age, y el email final del backend.

      if (backendResponse.token) {
        localStorage.setItem("token", backendResponse.token);
        
        // ⭐️ Actualizar el store con los datos COMBINADOS
        if (backendResponse.user) {
            const userLogged: User = {
                // Datos de Firebase
                displayName: firebaseUser.displayName, 
                photoURL: firebaseUser.photoURL,

                // Datos del Backend (que son los más precisos para el perfil)
                email: backendResponse.user.email || firebaseUser.email,
                firstName: backendResponse.user.firstName, 
                lastName: backendResponse.user.lastName,   
                age: backendResponse.user.age,             
            };
            set({ user: userLogged });
        }
        
      } else {
        console.error("Error en el servidor", backendResponse);
      }
    } catch (e) {
      console.error("Error iniciando sesión con Google", e);
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
    } catch (e: any) {
      console.error(e);
    }
  },
}));

export default useAuthStore;
