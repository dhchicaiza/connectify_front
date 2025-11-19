import { create } from "zustand";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../lib/firebase.config";
import { fetchLoginUserGoogle, fetchUserGit } from "../api/auth";

interface User {
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  
  // Propiedades del perfil para el backend
  firstName?: string; 
  lastName?: string;  
  age?: number;       
}

type AuthStore = {
  user: User | null;
  setUser: (user: User) => void;
  initAuthObserver: () => () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithGit: () => Promise<void>;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),

  initAuthObserver: () => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser) => {
        if (fbUser) {
          const userLogged: User = {
            displayName: fbUser.displayName,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
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
    } catch (e: any) {
      console.error(e);
    }
  },
}));

export default useAuthStore;
