// src/components/layout/Header.tsx

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "/avarta.png";

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
    
  // Hàm kiểm tra đường dẫn hiện tại để xác định mục đang được chọn
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return path !== '/' && location.pathname.startsWith(path);
  };
  
  // Style cho mục đang được chọn
  const activeStyle = "text-gray-900 font-semibold";
  const defaultStyle = "text-gray-600 hover:text-gray-900";

  return (
    <header className="sticky top-0 z-50 bg-light shadow-sm w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-10 object-cover rounded-full mr-2"
              />
              <span className="ml-2 text-xl font-semibold text-primary">
                PhilosoSpace
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-lg font-medium">
            <Link to="/" className={isActive('/') ? activeStyle : defaultStyle}>
              Trang chủ
            </Link>
            <Link to="/blogs" className={isActive('/blogs') ? activeStyle : defaultStyle}>
              Triết học
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
                        Bảng điều khiển
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
                    Hồ sơ cá nhân
                  </button>
                  <button
                    className="w-full text-left px-5 py-3 hover:bg-gray-100 text-gray-800 text-base rounded-b-xl"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-8 py-3 rounded-full border-2 border-primary text-xl font-medium text-primary bg-light hover:bg-primary-50 transition"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
