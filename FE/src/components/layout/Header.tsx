// src/components/layout/Header.tsx

function Header() {
  return (
    <header className="h-16 bg-white shadow px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Drug Use Prevention System</h1>
      <div className="text-sm text-gray-600">Welcome, Admin</div>
    </header>
  );
}

export default Header;
