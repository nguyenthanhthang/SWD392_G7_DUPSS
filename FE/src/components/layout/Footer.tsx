import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="relative bg-gradient-to-t from-[#DBE8FA] via-[#DBE8FA] to-white text-[#283593] pt-16 pb-24 px-4 md:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-0 justify-between items-start">
        {/* Logo và social */}
        <div className="flex-1 min-w-[220px] flex flex-col items-center md:items-start">
          <div className="text-4xl font-semibold font-sans mb-8">HopeHub</div>
          <div className="flex gap-8 mt-2 mb-8">
            <a href="#" className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-300 hover:bg-blue-400 transition text-2xl">
              <FaFacebookF />
            </a>
            <a href="#" className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-300 hover:bg-blue-400 transition text-2xl">
              <FaTwitter />
            </a>
            <a href="#" className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-300 hover:bg-blue-400 transition text-2xl">
              <FaInstagram />
            </a>
          </div>
        </div>
        {/* Menu columns */}
        <div className="flex-[2] grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
          <div>
            <div className="font-bold text-lg mb-4">Menu</div>
            <ul className="space-y-3 text-base">
              <li><a href="#" className="hover:underline">Trang chủ</a></li>
              <li><a href="#" className="hover:underline">Phổ biến</a></li>
              <li><a href="#" className="hover:underline">Giới thiệu</a></li>
              <li><a href="#" className="hover:underline">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-lg mb-4">Danh mục</div>
            <ul className="space-y-3 text-base">
              <li><a href="#" className="hover:underline">Thiết kế</a></li>
              <li><a href="#" className="hover:underline">Bản mẫu</a></li>
              <li><a href="#" className="hover:underline">Xem tất cả</a></li>
              <li><a href="#" className="hover:underline">Đăng nhập</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-lg mb-4">Trang</div>
            <ul className="space-y-3 text-base">
              <li><a href="#" className="hover:underline">404</a></li>
              <li><a href="#" className="hover:underline">Hướng dẫn</a></li>
              <li><a href="#" className="hover:underline">Giấy phép</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-lg mb-4">Khác</div>
            <ul className="space-y-3 text-base">
              <li><a href="#" className="hover:underline">Hướng dẫn giao diện</a></li>
              <li><a href="#" className="hover:underline">Nhật ký thay đổi</a></li>
            </ul>
          </div>
        </div>
      </div>
      {/* Copyright & links */}
      <div className="mt-16 border-t border-[#DBE8FA] pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-[#283593]">
        <div>
          @2023 - Đã đăng ký Bản quyền bởi Adminmart.com. Phân phối bởi ThemeWagon
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:underline">Chính sách bảo mật</a>
          <span className="mx-1">|</span>
          <a href="#" className="hover:underline">Điều khoản & điều kiện</a>
        </div>
      </div>
      {/* SVG sóng nước hologram full width, không có voi */}
      <div className="absolute left-0 bottom-0 w-full flex justify-center pointer-events-none select-none" style={{zIndex:1}}>
        <svg width="100%" height="120" viewBox="0 0 1440 120" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80 Q 360 120 720 80 T 1440 80 V120 H0Z" fill="#DBE8FA" fillOpacity="0.7"/>
          <path d="M0 100 Q 480 140 960 100 T 1440 100 V120 H0Z" fill="#283593" fillOpacity="0.8"/>
        </svg>
      </div>
    </footer>
  );
}

export default Footer;
