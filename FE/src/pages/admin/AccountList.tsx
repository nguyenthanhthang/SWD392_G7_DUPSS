import React, { useEffect, useState } from 'react';
import api from '../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

interface UpdateAccountForm {
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  gender: string;
}

const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [accountToToggle, setAccountToToggle] = useState<{id: string, isDisabled: boolean} | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<IAccount | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateAccountForm>({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    gender: ''
  });

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

  const openConfirmToggleModal = (id: string, isDisabled: boolean) => {
    setAccountToToggle({ id, isDisabled });
    setIsConfirmModalOpen(true);
  };

  const closeConfirmToggleModal = () => {
    setIsConfirmModalOpen(false);
    setAccountToToggle(null);
  };

  const handleToggleStatus = async () => {
    if (!accountToToggle) return;
    
    try {
      const { id, isDisabled } = accountToToggle;
      
      await api.put(`/accounts/${id}`, { 
        isDisabled: !isDisabled 
      });
      
      // Cập nhật state sau khi thay đổi trạng thái thành công
      setAccounts(accounts.map(account => 
        account._id === id 
          ? {...account, isDisabled: !isDisabled} 
          : account
      ));
      
      toast.success(isDisabled ? 'Đã mở khóa tài khoản thành công!' : 'Đã khóa tài khoản thành công!');
      closeConfirmToggleModal();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      toast.error('Không thể cập nhật trạng thái tài khoản');
      closeConfirmToggleModal();
    }
  };

  const handleOpenUpdateModal = (account: IAccount) => {
    setSelectedAccount(account);
    setUpdateForm({
      username: account.username,
      email: account.email,
      fullName: account.fullName || '',
      phoneNumber: account.phoneNumber || '',
      gender: account.gender || ''
    });
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedAccount(null);
    setUpdateForm({
      username: '',
      email: '',
      fullName: '',
      phoneNumber: '',
      gender: ''
    });
  };

  const handleUpdateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      const response = await api.put(`/accounts/${selectedAccount._id}`, updateForm);
      
      // Cập nhật state sau khi cập nhật thành công
      setAccounts(accounts.map(account => 
        account._id === selectedAccount._id 
          ? {...account, ...response.data} 
          : account
      ));

      handleCloseUpdateModal();
      toast.success('Cập nhật tài khoản thành công!');
    } catch (err: any) {
      console.error('Lỗi khi cập nhật tài khoản:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật tài khoản');
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
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
                        onClick={() => openConfirmToggleModal(account._id, account.isDisabled)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          account.isDisabled 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        {account.isDisabled ? 'Mở khóa' : 'Khóa'}
                      </button>
                      <button 
                        onClick={() => handleOpenUpdateModal(account)}
                        className="px-3 py-1 text-xs rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        Cập nhật
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

      {/* Modal Cập nhật tài khoản */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Cập nhật tài khoản</h2>
            <form onSubmit={handleUpdateAccount}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên tài khoản</label>
                  <input
                    type="text"
                    name="username"
                    value={updateForm.username}
                    onChange={handleUpdateFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={updateForm.email}
                    onChange={handleUpdateFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={updateForm.fullName}
                    onChange={handleUpdateFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={updateForm.phoneNumber}
                    onChange={handleUpdateFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                  <select
                    name="gender"
                    value={updateForm.gender}
                    onChange={handleUpdateFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận khóa/mở khóa tài khoản */}
      {isConfirmModalOpen && accountToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Xác nhận</h2>
            <p className="mb-6">
              {accountToToggle.isDisabled 
                ? 'Bạn có chắc chắn muốn mở khóa tài khoản này?' 
                : 'Bạn có chắc chắn muốn khóa tài khoản này?'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmToggleModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  accountToToggle.isDisabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {accountToToggle.isDisabled ? 'Mở khóa' : 'Khóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountList; 