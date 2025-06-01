// src/components/layout/Header.tsx

import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

function Header() {
  const [, setIsSticky] = useState(false);

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
    <header className="h-[110px] bg-white flex items-center justify-between px-32 border-b">
      {/* Logo bên trái */}
      <div className="text-[36px] font-semibold font-sans"><Link to="/">HopeHub</Link></div>
      {/* Menu giữa */}
      <nav className="flex gap-20 px-20 border-l border-r border-gray-200 text-[19px] font-normal text-gray-700 h-full items-center" style={{minWidth: '520px', justifyContent: 'center'}}>
        <a href="#" className="hover:text-black">About Us</a>
        <a href="#" className="hover:text-black"><Link to="/consulting">Consultant</Link></a>
        <a href="#" className="hover:text-black">FAQ</a>
        <a href="#" className="hover:text-black">Blog</a>
        <a href="#" className="hover:text-black">Testimonial</a>
      </nav>
      {/* Nút Sign In/Sign Out bên phải */}
      <Link  to="/login" className="px-8 py-3 rounded-full border-2 border-black text-xl font-medium text-black bg-white hover:bg-gray-100 transition">Sign In</Link>
    </header>
  );
}

export default Header;
