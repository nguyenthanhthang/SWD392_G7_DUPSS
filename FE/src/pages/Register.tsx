import logo from '../assets/logo1.png';
import loginImg from '../assets/login2.png';
import { useState } from 'react';
import { registerApi } from '../api';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    try {
      await registerApi(username, email, password, confirmPassword);
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err: unknown) {
      console.error('Register error:', err);
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        const data = axiosErr.response?.data as Record<string, string> | undefined;
        setError(data?.message || 'Đăng ký thất bại!');
        if (data) {
          setFieldErrors({
            username: data.username,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
          });
        }
      } else {
        setError('Đăng ký thất bại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <div className="flex items-center justify-center w-full h-screen lg:w-1/2 lg:h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm rounded-xl bg-white/70 backdrop-blur-md p-8">
          <img
            alt="HopeHub Logo"
            src={logo}
            className="mx-auto h-16 w-auto"
          />
          <p className="mt-2 text-center text-sm text-gray-600">
            <a href="#" className="font-semibold text-white-600">
              HopeHub - Where Recovery Meets Peace
            </a>
          </p>
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </a>
          </p>
          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-900">
                  Username
                </label>
                <div className="mt-2 relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'} placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm`}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={loading}
                  />
                  {fieldErrors.username && (
                    <div className="text-red-500 text-xs mt-1">{fieldErrors.username}</div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-2 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm`}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  {fieldErrors.email && (
                    <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm`}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(v => !v)}
                    disabled={loading}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.875-4.575A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.021-2.021A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10S2 17.523 2 12c0-1.657.403-3.22 1.125-4.575M9.879 9.879A3 3 0 0115 12m-6 0a3 3 0 016 0m-6 0a3 3 0 016 0" /></svg>
                    )}
                  </button>
                  {fieldErrors.password && (
                    <div className="text-red-500 text-xs mt-1">{fieldErrors.password}</div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                  Confirm Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm`}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    disabled={loading}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.875-4.575A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.021-2.021A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10S2 17.523 2 12c0-1.657.403-3.22 1.125-4.575M9.879 9.879A3 3 0 0115 12m-6 0a3 3 0 016 0m-6 0a3 3 0 016 0" /></svg>
                    )}
                  </button>
                  {fieldErrors.confirmPassword && (
                    <div className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</div>
                  )}
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm mt-2">{success}</div>
              )}
              
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-full h-screen lg:w-1/2 lg:h-screen">
        <img
          src={loginImg}
          alt="Login Illustration"
          className="w-full h-full object-cover object-left"
        />
      </div>
    </div>
  );
}

export default RegisterPage;
