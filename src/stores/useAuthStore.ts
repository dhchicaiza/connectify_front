import { create } from "zustand";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.config";
import { fetchLoginUserGoogle } from "../api/auth";

interface User {
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
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
      const result = await signInWithPopup(auth, googleProvider);

      const firebaseUser = result.user;
      const googleIdToken = await firebaseUser.getIdToken();

      const backendResponse = await fetchLoginUserGoogle(googleIdToken);
      
      const token = backendResponse.data?.token;
      const user = backendResponse.data?.user;

      if (token && user) {
        localStorage.setItem("gToken", backendResponse.data.token);
        useAuthStore.getState().setUser(user);
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
