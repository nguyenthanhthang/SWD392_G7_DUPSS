import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function AdminHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
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
  const avatarUrl = userInfo?.photoUrl || 'https://ui-avatars.com/api/?name=Admin&background=eee&color=555';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return date.toLocaleDateString('vi-VN', options);
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      {/* Thông tin thời gian và chào mừng */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center text-gray-600">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{formatDate(currentTime)}</span>
        </div>
        <div className="text-indigo-600 font-medium">
          Xin chào, {userInfo?.fullName || userInfo?.username || 'Admin'}!
        </div>
      </div>
      
      {/* Các nút chức năng và Profile dropdown */}
      <div className="flex items-center space-x-4">
        {/* Nút thông báo */}
        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition focus:outline-none"
            onClick={() => setShowDropdown(v => !v)}
          >
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border border-gray-300"
            />
            <span className="hidden md:inline font-medium text-gray-800">
              {userInfo?.username || userInfo?.fullName || 'Admin'}
            </span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center"
                onClick={() => { setShowDropdown(false); navigate('/admin/profile'); }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin cá nhân
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center"
                onClick={handleLogout}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader; 