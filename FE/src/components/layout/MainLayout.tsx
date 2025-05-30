// src/components/layout/MainLayout.tsx

import type { ReactNode } from "react";


import Header from "./Header";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <div className="flex flex-col flex-1 min-h-screen bg-gray-100">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
