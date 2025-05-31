// src/components/layout/Header.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminAvatar from "../../assets/images/admin-avatar.jpg";

function Header() {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-[5] ${
        isSticky ? "bg-white dark:bg-dark shadow-md" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between py-3 px-6 ml-64">
        <div className="flex items-center gap-4 lg:hidden">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <span className="material-icons-outlined">menu</span>
          </button>
        </div>

        <div className="flex-1 lg:flex-none">
          {/* Placeholder for left side */}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <span className="material-icons-outlined">notifications</span>
              <span className="absolute top-0 right-0 block w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>
          </div>

          <Link 
            to="/" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Phòng chống ma túy
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img 
                src={adminAvatar} 
                alt="Admin profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
