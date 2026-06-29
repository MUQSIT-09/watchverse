import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  login,
  signup,
  googleLogin,
} from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import {
  syncUser
} from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ visible: false, text: "", type: "error" });
  const toastTimerRef = useRef(null);

  // helper to show toast
  const showToast = (text, type = "error", duration = 4000) => {
    // clear existing
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ visible: true, text, type });
    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
      toastTimerRef.current = null;
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const mapAuthError = (err) => {
  // Firebase error codes are usually in err.code (e.g., "auth/user-not-found")
  const code = err?.code || "";
  const msg = (err && err.message) || "";

  switch (code) {
    case "auth/wrong-password":
      return "Wrong password. Please check your password and try again.";
    case "auth/user-not-found":
      return "No account found with this email (Invalid user).";
    case "auth/invalid-email":
      return "The email address is invalid. Please check and try again.";
    case "auth/email-already-in-use":
      return "This email is already in use. Try signing in or use another email.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup closed. Try again.";
    case "auth/cancelled-popup-request":
      return "Sign-in popup cancelled. Try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      // fallback: if there is a meaningful Firebase message, clean it up and show
      if (msg) {
        return msg
          .replace(/^Firebase:\s*/i, "")
          .replace(/\s*\(auth\/[^\)]+\)\.?/, "")
          .trim();
      }
      return "Something went wrong. Please try again.";
  }
};

  const handleAuth = async (e) => {
    e.preventDefault();

    // basic validation
    if (!email?.trim()) {
      showToast("Please enter your email.");
      return;
    }
    if (!password) {
      showToast("Please enter your password.");
      return;
    }
    if (signState === "Sign Up" && !name?.trim()) {
      showToast("Please enter your name for sign up.");
      return;
    }

    setLoading(true);

    try {
      if (signState === "Sign In") {
        const res = await login(email, password);
        // syncUser could fail — wrap it
        try {
          await syncUser(res.user);
        } catch (syncErr) {
          console.warn("syncUser failed:", syncErr);
          // still continue, but inform user we couldn't sync right away
          showToast("Signed in but failed to sync profile. Will retry.", "warning");
        }
        showToast("Signed in successfully.", "success");
      } else {
        // Sign Up
        const created = await signup(name, email, password);
        try {
          await syncUser(created);
        } catch (syncErr) {
          console.warn("syncUser failed:", syncErr);
          showToast("Account created but failed to sync profile. Will retry.", "warning");
        }
        showToast("Account created. Welcome!", "success");
      }

      // navigate after small delay so user can briefly see success toast
      setTimeout(() => navigate("/"), 300);
    } catch (error) {
      console.error("Auth error:", error);
      const friendly = mapAuthError(error);
      showToast(friendly, "error", 6000);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const res = await googleLogin();
      try {
        await syncUser(res.user);
      } catch (syncErr) {
        console.warn("syncUser failed:", syncErr);
        showToast("Signed in with Google but failed to sync profile. Will retry.", "warning");
      }
      showToast("Signed in with Google.", "success");
      setTimeout(() => navigate("/"), 300);
    } catch (error) {
      console.error("Google login error:", error);
      const friendly = mapAuthError(error);
      showToast(friendly, "error", 6000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
      min-h-screen
      bg-[#090D1A]
      relative
      flex
      items-center
      justify-center
      overflow-hidden
    "
    >
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-sky-500/20 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/20 blur-[120px]" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl"
      >
        {/* Toast */}
        {toast.visible && (
          <div
            className={`absolute left-4 right-4 top-4 z-30 rounded-lg px-4 py-2 shadow-md text-sm ${
              toast.type === "error"
                ? "bg-red-600 text-white"
                : toast.type === "warning"
                ? "bg-amber-500 text-black"
                : "bg-emerald-500 text-black"
            }`}
          >
            {toast.text}
          </div>
        )}

        {/* Heading */}
        <div className="text-center mb-8">
          <h1
            className="
            text-4xl
            font-black
            bg-gradient-to-r
            from-white
            via-slate-200
            to-sky-400
            bg-clip-text
            text-transparent
          "
          >
            WATCHVERSE
          </h1>

          <p className="mt-3 text-slate-400 text-sm">Track • Discover • Remember</p>
          <p className="mt-2 text-xs text-slate-500">
            Your entertainment universe, synced across every device.
          </p>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className={`w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-500">OR</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {signState === "Sign Up" && (
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 py-3 font-bold text-white transition hover:scale-[1.02] ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Please wait..." : signState}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {signState === "Sign In" ? (
            <>
              New to WatchVerse?{" "}
              <button
                onClick={() => setSignState("Sign Up")}
                className="text-sky-400 font-semibold"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setSignState("Sign In")}
                className="text-sky-400 font-semibold"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;