import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import styles from "./ButtonGoogle.module.scss";

interface ButtonGoogleProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const ButtonGoogle: React.FC<ButtonGoogleProps> = (
  {setErrorMessage}
) => {
  const { loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  const handleLoginGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithGoogle();
      navigate("/userhome")
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
