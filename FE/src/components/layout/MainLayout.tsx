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
