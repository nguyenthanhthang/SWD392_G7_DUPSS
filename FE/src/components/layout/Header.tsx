// src/components/layout/Header.tsx

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const [, setIsSticky] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Lấy userInfo từ localStorage
  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || 'null');
    } catch {
      return null;
    }
  })();
  const avatarUrl = userInfo?.photoUrl || 'https://ui-avatars.com/api/?name=User&background=eee&color=555';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Đóng dropdown khi click ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    window.location.href = '/';
  };

  return (
    <header className="h-[110px] bg-white flex items-center justify-between px-32 border-b">
      {/* Logo bên trái */}
      <div className="text-[36px] font-semibold font-sans">HopeHub</div>
      {/* Menu giữa */}
      <nav className="flex gap-20 px-20 border-l border-r border-gray-200 text-[19px] font-normal text-gray-700 h-full items-center" style={{minWidth: '520px', justifyContent: 'center'}}>
        <a href="#" className="hover:text-black">About Us</a>
        <a href="#" className="hover:text-black">Services</a>
        <a href="#" className="hover:text-black">FAQ</a>
        <a href="#" className="hover:text-black">Blog</a>
        <a href="#" className="hover:text-black">Testimonial</a>
      </nav>
      {/* Nút Sign In/Avatar bên phải */}
      {userInfo ? (
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-full border-2 border-gray-200 bg-white hover:bg-gray-100 transition focus:outline-none"
            onClick={() => setShowDropdown(v => !v)}
          >
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
            <span className="hidden md:inline font-medium text-gray-800 text-lg">{userInfo.username || userInfo.fullName || 'User'}</span>
            <svg className="w-5 h-5 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 animate-fade-in">
              <button
                className="w-full text-left px-5 py-3 hover:bg-gray-100 text-gray-800 text-base rounded-t-xl"
                onClick={() => { setShowDropdown(false); navigate('/profile'); }}
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
        <Link  to="/login" className="px-8 py-3 rounded-full border-2 border-black text-xl font-medium text-black bg-white hover:bg-gray-100 transition">Sign In</Link>
      )}
    </header>
  );
}

export default Header;
