import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import styles from "./ButtonGoogle.module.scss";

/**
 * Props for the reusable Google button component.
 */
interface ButtonGoogleProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  onSuccess?: () => void;
}

/**
 * Renders the Google sign-in button and centralises the OAuth flow.
 */
export const ButtonGoogle: React.FC<ButtonGoogleProps> = (
  {setErrorMessage, onSuccess}
) => {
  const { loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  /**
   * Launches the Google popup and reacts to success/failure.
   */
  const handleLoginGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      loginWithGoogle().then(() => navigate("/meeting"));
    } catch (error) {
      setErrorMessage("No se pudo iniciar sesión con el servicio de Google");
    }
  };

  return (
    <button
      type="button"
      className={styles.socialButton}
      onClick={handleLoginGoogle}
    >
      <span>G</span>
      <span>Google</span>
    </button>
  );
};
