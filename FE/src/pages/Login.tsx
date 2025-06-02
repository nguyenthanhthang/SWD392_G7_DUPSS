import loginImg from '../assets/login2.png';
import logo from '../assets/logo1.png';
import { useState } from 'react';
import { loginApi, loginWithGoogleApi, getAccountByIdApi } from '../api';
import { Link } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import type { CredentialResponse } from '@react-oauth/google';

type GoogleJwtPayload = { email: string; name?: string; picture?: string; [key: string]: unknown };

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(email, password);
      // Lưu token vào localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('userId', data.data.id);
      // Gọi API lấy thông tin user
      const user = await getAccountByIdApi(data.data.id);
      localStorage.setItem('userInfo', JSON.stringify(user));
      // Nếu role là customer thì chuyển về Home
      if (user.role === 'customer') {
        window.location.href = '/';
      } else {
        // Có thể chuyển hướng khác nếu không phải customer
        window.location.href = '/';
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Đăng nhập thất bại!');
      } else {
        setError('Đăng nhập thất bại!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth callback
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        alert('Đăng nhập Google thất bại!');
        return;
      }
      // Giải mã credential để lấy thông tin user
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
      const email = decoded.email;
      const username = decoded.name || email.split('@')[0];
      const photoUrl = decoded.picture || '';
      const data = await loginWithGoogleApi(email, username, photoUrl);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('userId', data.data.id);
      const user = await getAccountByIdApi(data.data.id);
      localStorage.setItem('userInfo', JSON.stringify(user));
      if (user.role === 'customer') {
        window.location.href = '/';
      } else {
        window.location.href = '/';
      }
    } catch {
      alert('Đăng nhập Google thất bại!');
    }
  };

  const handleGoogleError = () => {
    alert('Đăng nhập Google thất bại!');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-white overflow-hidden">
      {/* Ảnh nền */}
      <img
        src={loginImg}
        alt="Login Background"
        className="absolute inset-0 w-full h-full object-fill z-0"
      />
      {/* Overlay mờ */}
      <div className="absolute inset-0 bg-white/40 z-10" />
      {/* Khung login */}
      <div className="relative z-20 w-full max-w-lg mx-auto rounded-xl shadow-lg bg-white/70 backdrop-blur-md p-8 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
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
            Sign in to your account
          </h2>
          <h2 className="text-center text-l tracking-tight text-gray-900">
            Fist time? <Link to="/register" className="text-indigo-600 hover:text-indigo-500">Sign up</Link>
          </h2>

        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
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
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6 flex gap-4 justify-center">
              <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  width="100%"
                  shape="pill"
                  text="signin_with"
                  logo_alignment="center"
                  useOneTap
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
