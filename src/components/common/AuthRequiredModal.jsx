import { useNavigate } from "react-router-dom";
import { googleLogin } from "../../firebase/firebase";

const AuthRequiredModal = ({
  isOpen,
  onClose,
}) => {

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoogle =
    async () => {
      try {
        await googleLogin();
        onClose();
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div
      className="
      fixed
      inset-0
      z-[9999]
      bg-black/70
      backdrop-blur-sm
      flex
      items-center
      justify-center
      p-4
    "
    >
      <div
        className="
        w-full
        max-w-md
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
      "
      >
<div className="flex items-center justify-between">
  <h2
    className="
    text-2xl
    font-black
    text-white
  "
  >
    Save your WatchVerse journey
  </h2>

  <button
    onClick={onClose}
    className="
      text-slate-400
      hover:text-white
      text-xl
      font-bold
    "
  >
    ×
  </button>
</div>
        <div
          className="
          mt-5
          space-y-3
          text-slate-300
        "
        >
          <p>✓ Sync ratings</p>
          <p>✓ Sync reviews</p>
          <p>✓ Sync progress</p>
          <p>✓ Multi-device backup</p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogle}
            className="
            w-full
            rounded-xl
            bg-sky-500
            py-3
            font-bold
            text-white
          "
          >
            Continue with Google
          </button>

          <button
            onClick={() =>
              navigate("/login")
            }
            className="
            w-full
            rounded-xl
            border
            border-slate-700
            py-3
            font-bold
            text-white
          "
          >
            Login
          </button>

          <button
            onClick={onClose}
            className="
            w-full
            py-2
            text-slate-400
          "
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;