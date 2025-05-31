import React, { useEffect, useState } from 'react';
import api from '../../api';

// Interface cho dữ liệu tài khoản
interface IAccount {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  gender?: string;
  isDisabled: boolean;
  isVerified: boolean;
  photoUrl?: string;
}

const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hàm để lấy danh sách tài khoản
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/accounts');
        setAccounts(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Lỗi khi lấy danh sách tài khoản:', err);
        setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu');
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'consultant':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/accounts/${id}`, { 
        isDisabled: !currentStatus 
      });
      
      // Cập nhật state sau khi thay đổi trạng thái thành công
      setAccounts(accounts.map(account => 
        account._id === id 
          ? {...account, isDisabled: !currentStatus} 
          : account
      ));
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      setError('Không thể cập nhật trạng thái tài khoản');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-indigo-400">Danh sách tài khoản</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-left text-sm font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 rounded-tl-lg">Tên tài khoản</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 rounded-tr-lg">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <tr key={account._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex-shrink-0 mr-3">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={account.photoUrl || 'https://via.placeholder.com/40'}
                          alt={account.username}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{account.username}</p>
                        <p className="text-xs text-gray-500">{account.gender || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{account.email}</td>
                  <td className="px-4 py-3">{account.fullName || 'Chưa cập nhật'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(account.role)}`}>
                      {account.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${account.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {account.isDisabled ? 'Bị khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleToggleStatus(account._id, account.isDisabled)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          account.isDisabled 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        {account.isDisabled ? 'Mở khóa' : 'Khóa'}
                      </button>
                      <button className="px-3 py-1 text-xs rounded-full bg-indigo-500 hover:bg-indigo-600 text-white">
                        Chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Không có tài khoản nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountList; 