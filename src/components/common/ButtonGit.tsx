import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import styles from "./ButtonGoogle.module.scss";

/**
 * Props accepted by the GitHub login button.
 */
interface ButtonGitProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const ButtonGit: React.FC<ButtonGitProps> = (
  {setErrorMessage}
) => {
  const { loginWithGit} = useAuthStore();
  const navigate = useNavigate();

  /**
   * Handles the click event by launching the GitHub popup.
   */
  const handleLoginGit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      loginWithGit().then(() => navigate("/meeting"));
    } catch (error) {
      setErrorMessage("No se pudo iniciar sesión con el servicio de GitHub");
    }
  };

  return (
    <button
      type="button"
      className={styles.socialButton}
      onClick={handleLoginGit}
    >
      <span>G</span>
      <span>GitHub</span>
    </button>
  );
};
