import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Library from "../pages/Library";
import Calendar from "../pages/Calendar";
import Discover from "../pages/Discover";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/library" element={<Library />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
