// src/components/layout/MainLayout.tsx

import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex w-full min-h-screen bg-gray-50 dark:bg-darkgray">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header - Sử dụng AdminHeader cho trang admin và Header cho trang user */}
        {isAdminRoute ? <AdminHeader /> : <Header />}
        
        {/* Content */}
        <main className="p-8 mt-[72px]">
          <div className="bg-white rounded-[32px] min-h-[calc(100vh-8rem)] p-8 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
