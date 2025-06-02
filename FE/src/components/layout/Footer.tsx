import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 px-4 md:px-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-0 justify-between items-start">
        {/* Logo và social */}
        <div className="flex-1 min-w-[220px] flex flex-col items-center md:items-start">
          <div className="text-4xl font-semibold font-sans mb-8">HopeHub</div>
          <div className="flex gap-8 mt-2 mb-8">
            <a href="#" className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition text-2xl">
              <FaFacebookF />
            </a>
            <a href="#" className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition text-2xl">
              <FaTwitter />
            </a>
            <a href="#" className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition text-2xl">
              <FaInstagram />
            </a>
          </div>
        </div>
        {/* Menu columns */}
        <div className="flex-[2] grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
          <div>
            <div className="font-bold text-lg mb-4">Menu</div>
            <ul className="space-y-3 text-base">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="#" className="hover:underline">Popular</a></li>
              <li><a href="#" className="hover:underline">About</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-lg mb-4">Category</div>
            <ul className="space-y-3 text-base">
              <li><a href="#" className="hover:underline">Design</a></li>
              <li><a href="#" className="hover:underline">Mockup</a></li>
              <li><a href="#" className="hover:underline">View all</a></li>
              <li><a href="#" className="hover:underline">Log In</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-lg mb-4">Pages</div>
            <ul className="space-y-3 text-base">
              <li><a href="#" className="hover:underline">404</a></li>
              <li><a href="#" className="hover:underline">Instructions</a></li>
              <li><a href="#" className="hover:underline">License</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-lg mb-4">Others</div>
            <ul className="space-y-3 text-base">
              <li><a href="#" className="hover:underline">Styleguide</a></li>
              <li><a href="#" className="hover:underline">Changelog</a></li>
            </ul>
          </div>
        </div>
      </div>
      {/* Copyright & links */}
      <div className="mt-16 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
        <div>
          @2023 - All Rights Reserved by Adminmart.com. Distributed by ThemeWagon
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:underline">Privacy policy</a>
          <span className="mx-1">|</span>
          <a href="#" className="hover:underline">Terms & conditions</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
