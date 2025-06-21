// src/components/layout/Header.tsx

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "/avarta.png";

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatarUrl =
    user?.photoUrl ||
    `https://i.pravatar.cc/150?img=${user?.username?.length || 3}`;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-10 object-cover rounded-full mr-2"
              />
              <span className="ml-2 text-xl font-semibold text-[#283593]">
                HopeHub
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-lg font-medium">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link to="/quizz" className="text-gray-600 hover:text-gray-900">
              Quiz
            </Link>
            <Link
              to="/consulting"
              className="text-gray-600 hover:text-gray-900"
            >
              Consulting
            </Link>
            <Link to="/service" className="text-gray-600 hover:text-gray-900">
              Service
            </Link>
            <Link to="/events" className="text-gray-600 hover:text-gray-900">
              Events
            </Link>
            <Link to="/blogs" className="text-gray-600 hover:text-gray-900">
              Blogs
            </Link>
            <Link to="/about-us" className="text-gray-600 hover:text-gray-900">
              About Us
            </Link>
          </nav>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-1 p-2.5 rounded-full bg-white hover:bg-gray-50 transition focus:outline-none"
                onClick={() => setShowDropdown((v) => !v)}
              >
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-11 h-11 rounded-full object-cover"
                />
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 animate-fade-in">
                  {user.role === "admin" && (
                    <>
                      <button
                        className="w-full text-left px-5 py-3 hover:bg-gray-100 text-gray-800 text-base rounded-t-xl"
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/admin/dashboard");
                        }}
                      >
                        Dashboard
                      </button>
                      <div className="border-t border-gray-100"></div>
                    </>
                  )}
                  <button
                    className="w-full text-left px-5 py-3 hover:bg-gray-100 text-gray-800 text-base"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/profile");
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    className="w-full text-left px-5 py-3 hover:bg-gray-100 text-gray-800 text-base rounded-b-xl"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-8 py-3 rounded-full border-2 border-black text-xl font-medium text-black bg-white hover:bg-gray-100 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
