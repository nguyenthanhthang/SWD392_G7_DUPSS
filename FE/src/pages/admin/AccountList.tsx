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
  createdAt?: string;
  updatedAt?: string;
}

interface UpdateAccountForm {
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  gender: string;
  role?: string;
}

interface CreateAccountForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  gender: string;
  role: 'customer' | 'consultant';  // Restrict role types
}

// Available roles for account creation
const AVAILABLE_ROLES = [
  { value: 'customer', label: 'Khách hàng' },
  { value: 'consultant', label: 'Tư vấn viên' }
];

// Component Tooltip
interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
        {text}
      </div>
    </div>
  );
};

const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [accountToToggle, setAccountToToggle] = useState<{id: string, isDisabled: boolean} | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<IAccount | null>(null);
  const [accountDetail, setAccountDetail] = useState<IAccount | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateAccountForm>({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    gender: ''
  });
  const [createForm, setCreateForm] = useState<CreateAccountForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    gender: '',
    role: 'customer'
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Hàm để lấy danh sách tài khoản
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/accounts');
        setAccounts(response.data);
        setLoading(false);

        // Giả định user hiện tại là admin đầu tiên trong danh sách
        // Trong thực tế, bạn sẽ lấy thông tin này từ context auth hoặc localStorage
        const adminUser = response.data.find((account: IAccount) => account.role === 'admin');
        if (adminUser) {
          setCurrentUser(adminUser);
        }
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
      default: // customer
        return 'bg-emerald-100 text-emerald-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAdminAccount = (account: IAccount) => {
    return account.role === 'admin';
  };

  const canModifyRole = (account: IAccount) => {
    // Nếu user hiện tại là admin và đang cập nhật một tài khoản không phải của mình
    return currentUser && currentUser.role === 'admin' && currentUser._id !== account._id;
  };

  const openConfirmToggleModal = (id: string, isDisabled: boolean) => {
    const account = accounts.find(acc => acc._id === id);
    
    // Không cho phép vô hiệu hóa tài khoản admin
    if (account && account.role === 'admin') {
      toast.error('Không thể vô hiệu hóa tài khoản Admin');
      return;
    }
    
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

  const handleOpenDetailModal = async (id: string) => {
    try {
      setLoadingDetail(true);
      const response = await api.get(`/accounts/${id}`);
      setAccountDetail(response.data);
      setIsDetailModalOpen(true);
      setLoadingDetail(false);
    } catch (err: any) {
      console.error('Lỗi khi lấy chi tiết tài khoản:', err);
      toast.error(err.response?.data?.message || 'Không thể lấy chi tiết tài khoản');
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setAccountDetail(null);
  };

  const handleOpenUpdateModal = (account: IAccount) => {
    setSelectedAccount(account);
    setUpdateForm({
      username: account.username,
      email: account.email,
      fullName: account.fullName || '',
      phoneNumber: account.phoneNumber || '',
      gender: account.gender || '',
      role: account.role
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

    // Nếu là admin đang cập nhật chính mình, không cho phép thay đổi role
    if (currentUser && currentUser._id === selectedAccount._id && updateForm.role !== selectedAccount.role) {
      toast.error('Không thể thay đổi role của chính mình');
      return;
    }

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

  const handleOpenCreateModal = () => {
    setCreateForm({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: '',
      gender: '',
      role: 'customer'
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormErrors({});
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa lỗi khi người dùng sửa trường đó
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateCreateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Validate username
    if (!createForm.username) {
      errors.username = "Vui lòng nhập tên đăng nhập";
    } else if (createForm.username.length < 8 || createForm.username.length > 30) {
      errors.username = "Tên đăng nhập phải từ 8-30 ký tự";
    } else if (!/^[a-zA-Z0-9_]+$/.test(createForm.username)) {
      errors.username = "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
    }

    // Validate email
    if (!createForm.email) {
      errors.email = "Vui lòng nhập email";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(createForm.email)) {
      errors.email = "Email không hợp lệ";
    }

    // Validate password
    if (!createForm.password) {
      errors.password = "Vui lòng nhập mật khẩu";
    } else if (createForm.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(createForm.password)) {
      errors.password = "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt";
    }

    // Validate confirm password
    if (!createForm.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (createForm.password !== createForm.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    // Validate role
    if (!createForm.role) {
      errors.role = "Vui lòng chọn vai trò";
    } else if (!AVAILABLE_ROLES.some(r => r.value === createForm.role)) {
      errors.role = "Vai trò không hợp lệ";
    }

    // Validate required fields
    if (!createForm.fullName) errors.fullName = "Vui lòng nhập họ tên";
    if (!createForm.phoneNumber) errors.phoneNumber = "Vui lòng nhập số điện thoại";
    if (!createForm.gender) errors.gender = "Vui lòng chọn giới tính";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCreateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Tạo đối tượng dữ liệu cho request API
      const accountData = {
        username: createForm.username,
        email: createForm.email,
        password: createForm.password,
        fullName: createForm.fullName || '',
        phoneNumber: createForm.phoneNumber || '',
        gender: createForm.gender || undefined,
        role: createForm.role,
        isVerified: true // Admin tạo tài khoản thì mặc định đã xác thực
      };
      
      // Gọi API tạo tài khoản
      const response = await api.post('/accounts', accountData);
      
      // Thêm tài khoản mới vào state
      setAccounts([...accounts, response.data]);
      
      // Đóng modal và hiện thông báo thành công
      handleCloseCreateModal();
      toast.success('Tạo tài khoản thành công!');
    } catch (err: any) {
      console.error('Lỗi khi tạo tài khoản:', err);
      
      // Xử lý lỗi từ server nếu có
      if (err.response?.data?.error?.code === 11000) {
        // Lỗi trùng lặp (duplicate key)
        if (err.response.data.error.keyPattern?.username) {
          setFormErrors(prev => ({ ...prev, username: 'Tên đăng nhập đã tồn tại' }));
        }
        if (err.response.data.error.keyPattern?.email) {
          setFormErrors(prev => ({ ...prev, email: 'Email đã tồn tại' }));
        }
      } else {
        toast.error(err.response?.data?.message || 'Không thể tạo tài khoản');
      }
    } finally {
      setIsSubmitting(false);
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
    <div className="p-4 bg-white rounded-lg shadow-sm">
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-indigo-400">Quản lý tài khoản</h1>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm tài khoản
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-purple-50 text-gray-600 text-left text-sm font-semibold uppercase tracking-wider">
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
                <tr key={account._id} className="border-b border-gray-200 hover:bg-purple-50">
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
                    <div className="flex items-center space-x-3">
                      {/* Chỉ hiện nút khóa/mở khóa cho các tài khoản không phải admin */}
                      {!isAdminAccount(account) && (
                        <Tooltip text={account.isDisabled ? 'Mở khóa' : 'Khóa'}>
                          <button 
                            onClick={() => openConfirmToggleModal(account._id, account.isDisabled)}
                            className={`p-2 rounded-full ${
                              account.isDisabled 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                          >
                            {account.isDisabled ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </button>
                        </Tooltip>
                      )}
                      
                      <Tooltip text="Cập nhật">
                        <button 
                          onClick={() => handleOpenUpdateModal(account)}
                          className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </Tooltip>
                      
                      <Tooltip text="Chi tiết">
                        <button 
                          onClick={() => handleOpenDetailModal(account._id)}
                          className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </Tooltip>
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
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Cập nhật tài khoản</h2>
              <button
                onClick={handleCloseUpdateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
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

                {/* Thêm trường role */}
                {selectedAccount && canModifyRole(selectedAccount) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                    <select
                      name="role"
                      value={updateForm.role}
                      onChange={handleUpdateFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="customer">Customer</option>
                      <option value="consultant">Consultant</option>
                      {/* Admin không thể thay đổi role của mình */}
                      {selectedAccount.role === 'admin' && (
                        <option value="admin">Admin</option>
                      )}
                    </select>
                    {selectedAccount.role === 'admin' && currentUser && currentUser._id === selectedAccount._id && (
                      <p className="mt-1 text-xs text-red-500">Admin không thể thay đổi vai trò của chính mình</p>
                    )}
                  </div>
                )}
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
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Xác nhận</h2>
              <button
                onClick={closeConfirmToggleModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="mb-6 flex items-center">
              <div className={`mr-4 p-3 rounded-full ${accountToToggle.isDisabled ? 'bg-green-100' : 'bg-red-100'}`}>
                {accountToToggle.isDisabled ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              <p>
                {accountToToggle.isDisabled 
                  ? 'Bạn có chắc chắn muốn mở khóa tài khoản này?' 
                  : 'Bạn có chắc chắn muốn khóa tài khoản này?'}
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmToggleModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center ${
                  accountToToggle.isDisabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {accountToToggle.isDisabled ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Mở khóa
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Khóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi tiết tài khoản */}
      {isDetailModalOpen && accountDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Chi tiết tài khoản</h2>
              <button
                onClick={handleCloseDetailModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 mb-4">
                    <img
                      className="h-32 w-32 rounded-full object-cover"
                      src={accountDetail.photoUrl || 'https://via.placeholder.com/128'}
                      alt={accountDetail.username}
                    />
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${getRoleBadgeClass(accountDetail.role)}`}>
                    {accountDetail.role}
                  </span>
                  <span className={`mt-2 px-3 py-1 text-sm rounded-full ${accountDetail.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {accountDetail.isDisabled ? 'Đã bị khóa' : 'Đang hoạt động'}
                  </span>
                  <span className={`mt-2 px-3 py-1 text-sm rounded-full ${accountDetail.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {accountDetail.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ID</p>
                    <p className="mt-1">{accountDetail._id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tên tài khoản</p>
                    <p className="mt-1">{accountDetail.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{accountDetail.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Họ tên</p>
                    <p className="mt-1">{accountDetail.fullName || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                    <p className="mt-1">{accountDetail.phoneNumber || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Giới tính</p>
                    <p className="mt-1">{accountDetail.gender || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                      <p className="mt-1">{formatDate(accountDetail.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Lần cập nhật cuối</p>
                      <p className="mt-1">{formatDate(accountDetail.updatedAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        handleCloseDetailModal();
                        handleOpenUpdateModal(accountDetail);
                      }}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Cập nhật
                    </button>
                    {/* Ẩn nút khóa/mở khóa đối với tài khoản admin */}
                    {!isAdminAccount(accountDetail) && (
                      <button
                        onClick={() => {
                          handleCloseDetailModal();
                          openConfirmToggleModal(accountDetail._id, accountDetail.isDisabled);
                        }}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md ${
                          accountDetail.isDisabled 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {accountDetail.isDisabled ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            Mở khóa
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Khóa
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tạo tài khoản mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tạo tài khoản mới</h2>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              {/* Username field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                <input
                  type="text"
                  name="username"
                  value={createForm.username}
                  onChange={handleCreateFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={createForm.email}
                  onChange={handleCreateFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={createForm.password}
                  onChange={handleCreateFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Confirm Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={createForm.confirmPassword}
                  onChange={handleCreateFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>

              {/* Full Name field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={createForm.fullName}
                  onChange={handleCreateFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Phone Number field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={createForm.phoneNumber}
                  onChange={handleCreateFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Gender field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                <select
                  name="gender"
                  value={createForm.gender}
                  onChange={handleCreateFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="nam">Nam</option>
                  <option value="nữ">Nữ</option>
                </select>
              </div>

              {/* Role field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                <select
                  name="role"
                  value={createForm.role}
                  onChange={handleCreateFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {AVAILABLE_ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountList; 