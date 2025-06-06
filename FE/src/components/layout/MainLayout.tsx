// src/components/layout/MainLayout.tsx

import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {isAdminPage ? <AdminHeader /> : <Header />}

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar - chỉ hiển thị ở trang admin */}
        {isAdminPage && user && <Sidebar />}

        {/* Content */}
        <main className={`flex-1 ${isAdminPage ? 'ml-64' : ''} p-6 pt-16`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
