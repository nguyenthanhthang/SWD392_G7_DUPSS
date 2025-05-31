// src/components/layout/MainLayout.tsx

import { type ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex w-full min-h-screen bg-gray-50 dark:bg-darkgray">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <Header />
        
        {/* Content */}
        <main className="px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
