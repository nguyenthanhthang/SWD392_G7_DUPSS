import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import avatarSample from "../../assets/images/admin-avatar.jpg";

interface ConsultantLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    path: "/consultants/dashboard",
    name: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: "/consultants/schedule",
    name: "Schedule Management",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: "/consultants/patient",
    name: "Patient Management",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    path: "/consultants/reports",
    name: "Reports & Updates",
    icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function ConsultantLayout({ children }: ConsultantLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/consultants/dashboard") {
      return location.pathname === "/consultants" || location.pathname === path;
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 flex flex-col justify-between items-center py-4 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 shadow transition-all duration-300 h-screen w-16 z-30">
        {/* Logout button */}
        <div className="flex flex-col items-center w-full mb-8">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:bg-gray-100 transition text-gray-500 mb-2"
            onClick={handleLogout}
            title="Logout"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
        {/* Menu icons */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-100 bg-white hover:bg-gray-100 transition
                ${isActive(item.path) ? "ring-2 ring-black" : ""}`}
              title={item.name}
            >
              {React.cloneElement(item.icon, { className: "w-5 h-5 text-gray-500" })}
            </Link>
          ))}
        </div>
        {/* Small avatar at bottom */}
        <div className="flex flex-col items-center w-full mb-2">
          <Link to="/consultants/consultant-profile">
            <img
              src={user?.photoUrl || avatarSample}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-gray-100 mb-2 object-cover hover:ring-2 hover:ring-blue-400 transition"
              title="Hồ sơ cá nhân"
            />
          </Link>
        </div>
      </div>
      {/* Main content */}
      <main className="flex-1 ml-16 overflow-y-auto h-screen">{children}</main>
    </div>
  );
}
