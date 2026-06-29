import Sidebar from "./Sidebar";
import OfflineBanner from "../OfflineBanner"; // <-- add this

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <OfflineBanner />      {/* <-- mount here so it is visible across site */}
      <Sidebar />

      <main className="p-4 sm:p-6 lg:ml-64 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;