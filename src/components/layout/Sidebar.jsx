import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { logout } from "../../firebase/firebase";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Library", path: "/library" },
    { name: "Calendar", path: "/calendar" },
    { name: "Discover", path: "/discover" },
    { name: "Profile", path: "/profile" },
  ];

  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const handleAuth = async () => {
    try {
      if (isLoggedIn) {
        await logout();
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-800/70
        bg-[#090D1A]
        text-white
        lg:fixed
        lg:left-0
        lg:top-0
        lg:h-screen
        lg:w-64
        lg:border-b-0
        lg:border-r
        lg:border-slate-800/60
        flex
        flex-col
      "
    >
      {/* Header Area */}
      <div
        className="
          flex
          items-center
          justify-between
          px-5
          py-5
          lg:px-8
          lg:pt-10
          lg:pb-12
          lg:block
        "
      >
        <h1
          className="
            text-xl
            lg:text-2xl
            font-black
            tracking-wider
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
        
        {/* Mobile Premium Glass Auth Button - Fixed with Instant SVG */}
        <button
          onClick={handleAuth}
          className="
            p-2.5
            rounded-xl
            bg-sky-500
            hover:bg-sky-400
            shadow-[0_0_15px_rgba(14,165,233,0.4)]
            transition-all
            duration-200
            active:scale-95
            lg:hidden
            flex
            items-center
            justify-center
          "
        >
          {isLoggedIn ? (
            /* Instant Logout SVG */
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
            </svg>
          ) : (
            /* Instant Login SVG */
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation Links with Proper Dynamic Layout and No-Scrollbar */}
      <nav
        className="
          flex
          overflow-x-auto
          scroll-smooth
          justify-start
          gap-2
          px-5
          pb-4
          
          /* Native Horizontal Scrollbar Remover */
          [&::-webkit-scrollbar]:hidden 
          [-ms-overflow-style:none] 
          [scrollbar-width:none]
          
          lg:flex-col
          lg:overflow-visible
          lg:px-4
          lg:pb-0
          lg:gap-2
        "
      >
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `shrink-0 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 lg:w-full lg:px-5 lg:py-3.5 ${
                isActive
                  ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-[0_4px_20px_rgba(14,165,233,0.3)]"
                  : "hover:bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Lower Profile, Premium Button & Hyderabad Signature (Desktop Only) */}
      <div className="hidden lg:mt-auto lg:p-4 lg:flex lg:flex-col lg:gap-4">
        
        {/* User Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-md flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <p className="font-bold text-sm text-slate-200 truncate">
              {user?.displayName || "Guest"}
            </p>
            <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-0.5 truncate">
               Explorer
            </p>
          </div>
          
          {/* Desktop Enhanced Clear Glass Button - Fixed with Instant SVG */}
          <button
            onClick={handleAuth}
            title={isLoggedIn ? "Logout" : "Login"}
            className="
              p-2.5
              rounded-xl
              bg-slate-800
              hover:bg-sky-500
              border
              border-slate-700
              hover:border-sky-400
              text-white
              transition-all
              duration-300
              group
              flex
              items-center
              justify-center
              hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]
            "
          >
            {isLoggedIn ? (
              /* Desktop Instant Logout SVG */
              <svg className="h-4.5 w-4.5 text-slate-400 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
              </svg>
            ) : (
              /* Desktop Instant Login SVG */
              <svg className="h-4.5 w-4.5 text-slate-400 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
          </button>
        </div>

        {/* Hyderabad Footer Signature */}
        <div className="text-center pt-1 pb-2 border-t border-slate-900">
          <p className="text-[10px] font-semibold text-slate-500 tracking-wide flex items-center justify-center gap-1 hover:text-sky-400 transition-colors duration-300">
            Made with <span className="text-rose-500 animate-pulse">❤️</span> in Hyd 🕌
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;