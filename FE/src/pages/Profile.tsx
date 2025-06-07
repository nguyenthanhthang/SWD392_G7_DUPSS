import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccountByIdApi } from '../api';
import whaleLogo from '../assets/whale.png';

interface User {
  _id?: string;
  username?: string;
  email?: string;
  password?: string;
  photoUrl?: string;
  fullName?: string;
  phoneNumber?: string;
  role?: "customer" | "consultant" | "admin";
  gender?: "nam" | "nữ";
  isVerified?: boolean;
  isDisabled?: boolean;
}

const menuTabs = [
  { key: 'profile', label: 'User Profile' },
  { key: 'Appointments', label: 'Appointments' },
  { key: 'payments', label: 'Payments' },
];

export default function Profile() {
  const [tab, setTab] = useState('profile');
  const [user, setUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<User>({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        const data = await getAccountByIdApi(userId);
        setUser(data);
        setEditData(data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleEdit = () => setEditMode(true);

  const firstName = user?.fullName?.split(' ')[0] || '';
  const lastName = user?.fullName?.split(' ').slice(1).join(' ') || '';

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex flex-col items-center py-8">
      {/* Nút quay về trang chủ */}
      <div className="w-full max-w-5xl mb-4">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 font-medium hover:underline bg-white rounded-lg px-3 py-1.5 shadow-sm border border-blue-100 ml-2 mt-2"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Quay về trang chủ
        </Link>
      </div>
      <div className="bg-white rounded-3xl shadow-sm flex flex-col w-full max-w-5xl overflow-hidden relative">
        {/* Main content container */}
        <div className="flex flex-row w-full">
          {/* Sidebar */}
          <div className="w-64 py-10 px-6 bg-[#f7fafd]">
            <nav className="flex flex-col gap-2">
              {menuTabs.map(m => (
                m.key === 'Appointments' ? (
                  <Link
                    key={m.key}
                    to="/appointments"
                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${tab === m.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-blue-50'}`}
                  >
                    {m.label}
                  </Link>
                ) : m.key === 'payments' ? (
                  <Link
                    key={m.key}
                    to="/payment-history"
                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${tab === m.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-blue-50'}`}
                  >
                    {m.label}
                  </Link>
                ) : (
                  <button
                    key={m.key}
                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${tab === m.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-blue-50'}`}
                    onClick={() => setTab(m.key)}
                  >
                    {m.label}
                  </button>
                )
              ))}
              <div className="mt-auto pt-8 border-t border-gray-200 mt-8">
                <Link to="/login" className="text-red-500 font-medium hover:underline flex items-center gap-2 px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 10-2 0v4a1 1 0 102 0V8z" clipRule="evenodd" />
                  </svg>
                  Sign out
                </Link>
              </div>
            </nav>
          </div>
          {/* Main content */}
          <div className="flex-1 p-10">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">User profile</h2>
            <p className="text-gray-500 mb-8">Manage your details, view your tier status and change your password.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Avatar + Name */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center">
                <img src={user?.photoUrl || 'https://i.pravatar.cc/150?img=3'} alt="avatar" className="w-24 h-24 rounded-full mb-4" />
                <div className="font-bold text-lg text-gray-800 mb-1">{user?.fullName || '---'}</div>
                <div className="text-gray-500 text-sm mb-2">{user?.phoneNumber || ''}</div>
                <div className="text-blue-500 font-medium text-sm cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
              
              {/* General info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="font-semibold text-gray-700 mb-6">General information</div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-500 text-sm mb-2">First name</label>
                    <input 
                      disabled={!editMode} 
                      className="w-full border border-gray-200 rounded-md px-4 py-2 bg-gray-50 text-gray-700" 
                      value={editMode ? editData.fullName?.split(' ')[0] || '' : firstName} 
                      onChange={e => setEditData({ ...editData, fullName: e.target.value + ' ' + lastName })} 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-2">Last name</label>
                    <input 
                      disabled={!editMode} 
                      className="w-full border border-gray-200 rounded-md px-4 py-2 bg-gray-50 text-gray-700" 
                      value={editMode ? editData.fullName?.split(' ').slice(1).join(' ') || '' : lastName} 
                      onChange={e => setEditData({ ...editData, fullName: firstName + ' ' + e.target.value })} 
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button 
                    className={`px-6 py-2 rounded-lg font-medium ${editMode ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-500'}`}
                  >
                    Update
                  </button>
                  {!editMode && (
                    <button onClick={handleEdit} className="ml-4 text-blue-600 text-sm font-medium">
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Security */}
            <div className="mt-8">
              <div className="font-semibold text-gray-700 mb-6">Security</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-md p-4">
                  <label className="block text-gray-500 text-sm mb-2">Email</label>
                  <div className="text-gray-700 font-medium">{user?.email || ''}</div>
                </div>
                <div className="bg-gray-50 rounded-md p-4">
                  <label className="block text-gray-500 text-sm mb-2">Password</label>
                  <div className="text-gray-700 font-medium">••••••</div>
                </div>
                <div className="bg-gray-50 rounded-md p-4">
                  <label className="block text-gray-500 text-sm mb-2">Phone number</label>
                  <div className="text-gray-700 font-medium">{user?.phoneNumber || ''}</div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium bg-white">
                  Change password
                </button>
                <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium bg-white">
                  Change phone number
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom wave decoration */}
        <div className="w-full h-24 mt-12 relative">
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
              <path fill="#b1e2f3" fillOpacity="1" d="M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,128C672,139,768,181,864,176C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <img 
              src={whaleLogo} 
              alt="Whale decoration" 
              className="absolute right-16 bottom-4 w-32 h-auto opacity-80" 
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
