import { create } from "zustand";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../lib/firebase.config";
import { fetchLoginUserGoogle, fetchUserGit } from "../api/auth";
import { fetchUserProfile } from "../api/user";

// ⭐️ Interfaz User Extendida
// Incluye las propiedades de Firebase (email, displayName) y las propiedades del Backend (firstName, lastName, age).
// Las propiedades del backend son opcionales (?) porque pueden no estar disponibles inmediatamente (ej. después de initAuthObserver).
/**
 * Shape of the authenticated user stored in the global state.
 * Combines Firebase information with backend profile fields.
 */
interface User {
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  
  // Propiedades del perfil para el backend
  firstName?: string; 
  lastName?: string;  
  age?: number;       
}

/**
 * Contract that describes every action exposed by the auth store.
 */
type AuthStore = {
  user: User | null;
  setUser: (user: User) => void;
  initAuthObserver: () => () => void;
  restoreAuthFromToken: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGit: () => Promise<void>;
  logout: () => Promise<void>;
};

/**
 * Global auth store: keeps Firebase auth state in sync with backend data
 * and exposes helper actions (login, logout, restore session, etc.).
 */
const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  // setUser ahora acepta la interfaz extendida 'User'
  setUser: (user: User) => set({ user }),

  /**
   * Subscribes to Firebase auth changes and keeps the store up to date.
   * @returns {() => void} Function to unsubscribe from the observer.
   */
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
          // Si Firebase no tiene usuario, verificar si hay token en localStorage
          const token = localStorage.getItem("token");
          if (!token) {
            set({ user: null });
            localStorage.removeItem("token");
          }
          // Si hay token pero no usuario de Firebase, restaurar desde el backend
        }
      },
      (err) => {
        console.error(err);
      }
    );
    return unsubscribe;
  },

  /**
   * Fetches the profile from the backend when a JWT token exists
   * but Firebase has not yet populated the user in the store.
   */
  restoreAuthFromToken: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    // Si ya hay un usuario en el store, no hacer nada
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      return;
    }

    try {
      const data = await fetchUserProfile();
      if (data?.data) {
        const userData = data.data;
        const restoredUser: User = {
          email: userData.email || null,
          displayName: userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}`
            : userData.email || null,
          firstName: userData.firstName,
          lastName: userData.lastName,
          age: userData.age,
        };
        set({ user: restoredUser });
      }
    } catch (error) {
      // Si el token es inválido o expiró, limpiar
      console.error("Error restaurando autenticación:", error);
      localStorage.removeItem("token");
      set({ user: null });
    }
  },

  /**
   * Signs the user in with Google via Firebase and completes the flow
   * by exchanging the token with the backend.
   */
  loginWithGoogle: async () => {
    try {

      googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
      const result = await signInWithPopup(auth, googleProvider);

      const firebaseUser = result.user;
      const googleIdToken = await firebaseUser.getIdToken();
      console.log("Google ID Token obtenido:", googleIdToken);
      const backendResponse = await fetchLoginUserGoogle(googleIdToken);
      console.log("Respuesta del backend tras login con Google:", backendResponse);
      if (backendResponse.data.token) {
        localStorage.setItem("token", backendResponse.data.token);
        
        if (backendResponse.data.user) {
            const userLogged: User = {
                // Datos de Firebase
                displayName: firebaseUser.displayName, 
                photoURL: firebaseUser.photoURL,

                email: backendResponse.data.user.email ,
                firstName: backendResponse.data.user.firstName, 
                lastName: backendResponse.data.user.lastName,   
                age: backendResponse.data.user.age,             
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

  loginWithGit: async () => {
    try {
      console.log("ESta pasando po r aqui");
      githubProvider.setCustomParameters({
            prompt: 'select_account'
        });
      const result = await signInWithPopup(auth, githubProvider);
      const firebaseUser = result.user;
      const githubIdToken = await firebaseUser.getIdToken();
      console.log("git ID Token obtenido:", githubIdToken);
      const backendResponse = await fetchUserGit(githubIdToken);
      console.log("Respuesta del backend tras login con Git:", backendResponse);
      if (backendResponse.data.token) {
        localStorage.setItem("token", backendResponse.data.token);
        
        if (backendResponse.data.user) {
            const userLogged: User = {
                // Datos de Firebase
                displayName: firebaseUser.displayName, 
                photoURL: firebaseUser.photoURL,

                email: backendResponse.data.user.email ,
                firstName: backendResponse.data.user.firstName, 
                lastName: backendResponse.data.user.lastName,   
                age: backendResponse.data.user.age,             
            };
            set({ user: userLogged });
        }
        
      } else {
        console.error("Error en el servidor", backendResponse);
      }
    } catch (e) {
      console.error("Error iniciando sesión con Git", e);
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      set({ user: null });
    } catch (e: any) {
      console.error(e);
      // Incluso si Firebase falla, limpiar el estado local
      localStorage.removeItem("token");
      set({ user: null });
    }
  },
}));

export default useAuthStore;
