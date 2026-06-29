import { useState } from "react"; // 1. Sirf useState chahiye
import { useAuth } from "../../context/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  // 2. Pure greeting logic function
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good morning";
    } else if (hour >= 12 && hour < 15) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  }

  // 3. Direct function call initial state mein! 
  // Isse component directly sahi string ke sath hi render hoga.
  const [greeting] = useState(getGreeting); 

  return (
    <div className="mb-12">
      <div>
        <div>
          <h1
            className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            lg:text-6xl
            font-black
            text-white
            "
          >
            {greeting}, {user?.displayName || "Guest"}
          </h1>

          <p
            className="
            text-sm
            sm:text-base
            md:text-lg
            lg:text-xl
            text-slate-400
            mt-3
            "
          >
            {user
              ? "Your entertainment universe, synced across every device."
              : "Create an account to track shows, reviews and watch progress."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;