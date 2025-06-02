import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Đổi lại nếu BE chạy port khác hoặc có prefix khác
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginApi = async (login: string, password: string) => {
  // login có thể là email hoặc username
  const res = await api.post('/auth/login', { login, password });
  return res.data;
};

export const registerApi = async (username: string, email: string, password: string, confirmPassword: string) => {
  const res = await api.post('/auth/register', { username, email, password, confirmPassword });
  return res.data;
};

export const loginWithGoogleApi = async (email: string, username: string, photoUrl: string) => {
  const res = await api.post('/auth/login-google', { email, username, photoUrl });
  return res.data;
};

export const sendOtpApi = async (email: string, username: string) => {
  const res = await api.post('/auth/send-new-verify-email', { email, username });
  return res.data;
};

export const checkOtpApi = async (verifyCode: string) => {
  const res = await api.post('/auth/check-otp', { verifyCode });
  return res.data;
};

export default api; 