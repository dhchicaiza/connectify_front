import { create } from "zustand";
import { fetchLoginUser } from "../api/auth";

export interface BackendUser {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  provider: "email" | "google" | "facebook";
  providerId?: string;
  createdAt: string;
  updatedAt: string;
}

type BackendAuthStore = {
  bUser: BackendUser | null;
  token: string | null;

  setBackendUser: (user: BackendUser, token: string) => void;
  loginBackend: (email: string, password: string) => Promise<void>;
  logoutBackend: () => void;
};

const useBackendAuthStore = create<BackendAuthStore>((set) => ({

  // Estado inicial
  bUser: null,
  token: localStorage.getItem("bToken"),

  setBackendUser: (user, token) => {
    localStorage.setItem("bToken", token);

    set({
      bUser: user,
      token: token,
    });
  },


  loginBackend: async (email, password) => {
    const response = await fetchLoginUser(email, password);

    if (!response.data || !response.data.token || !response.data.user) {
      throw new Error("Respuesta inválida del servidor");
    }

    const { user, token } = response.data;

    set({
      bUser: user,
      token: token,
    });

    localStorage.setItem("bToken", token);
  },

  logoutBackend: () => {
    localStorage.removeItem("bToken");

    set({
      bUser: null,
      token: null,
    });
  },

}));

export default useBackendAuthStore;
