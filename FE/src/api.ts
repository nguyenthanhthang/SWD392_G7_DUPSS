import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Đổi lại nếu BE chạy port khác hoặc có prefix khác
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage on unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const loginApi = async (login: string, password: string) => {
  // login có thể là email hoặc username
  const res = await api.post("/auth/login", { login, password });
  return res.data;
};

export const registerApi = async (
  username: string,
  email: string,
  password: string,
  confirmPassword: string
) => {
  const res = await api.post("/auth/register", {
    username,
    email,
    password,
    confirmPassword,
  });
  return res.data;
};

export const loginWithGoogleApi = async (
  email: string,
  username: string,
  photoUrl: string
) => {
  const res = await api.post("/auth/login-google", {
    email,
    username,
    photoUrl,
  });
  return res.data;
};

export const sendOtpApi = async (email: string, username: string) => {
  const res = await api.post("/auth/send-new-verify-email", {
    email,
    username,
  });
  return res.data;
};

export const checkOtpApi = async (verifyCode: string) => {
  const res = await api.post("/auth/check-otp", { verifyCode });
  return res.data;
};

// Lấy thông tin account theo id
export const getAccountByIdApi = async (id: string) => {
  const res = await api.get(`/accounts/${id}`);
  return res.data;
};

// Lấy danh sách consultant
export const getAllConsultantsApi = async () => {
  const res = await api.get("/consultants");
  return res.data;
};

// Lấy thông tin chi tiết consultant theo id
export const getConsultantByIdApi = async (id: string) => {
  const res = await api.get(`/consultants/${id}`);
  return res.data;
};

// Lấy danh sách dịch vụ
export const getAllServicesApi = async () => {
  const res = await api.get("/services");
  return res.data;
};

// Lấy danh sách certificate
export const getAllCertificatesApi = async () => {
  const res = await api.get("/certificates");
  return res.data;
};

// Lấy slot time theo consultant_id
export const getSlotTimeByConsultantIdApi = async (consultantId: string) => {
  const res = await api.get(`/slot-times/consultant/${consultantId}`);
  return res.data;
};

export const createSlotTimeApi = async (data: {
  consultant_id: string;
  start_time: string;
  end_time: string;
  status: string;
}) => {
  const res = await api.post("/slot-times", data);
  return res.data;
};

export const updateSlotTimeApi = async (
  id: string,
  data: { start_time: string; end_time: string }
) => {
  const res = await api.put(`/slot-times/${id}`, data);
  return res.data;
};

export const updateStatusSlotTimeApi = async (id: string, status: string) => {
  const res = await api.put(`/slot-times/status/${id}`, { status });
  return res.data;
};

export const deleteSlotTimeApi = async (id: string) => {
  const res = await api.delete(`/slot-times/${id}`);
  return res.data;
};

// Event APIs
export const getAllEventsApi = async (status?: string) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  const res = await api.get(`/events?${params.toString()}`);
  return res.data;
};

export const getEventByIdApi = async (id: string) => {
  const res = await api.get(`/events/${id}`);
  return res.data;
};

export const createEventApi = async (data: {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  consultantId: string;
}) => {
  const res = await api.post("/events", data);
  return res.data;
};

export const updateEventApi = async (
  id: string,
  data: Partial<{
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    capacity: number;
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
  }>
) => {
  const res = await api.put(`/events/${id}`, data);
  return res.data;
};

export const deleteEventApi = async (id: string) => {
  const res = await api.delete(`/events/${id}`);
  return res.data;
};

export const registerEventApi = async (eventId: string, userId: string) => {
  const res = await api.post(`/events/${eventId}/register`, { userId });
  return res.data;
};
// Gửi OTP về email
export const sendNewVerifyEmailApi = async (email: string, username: string) => {
  const res = await api.post('/auth/send-new-verify-email', { email, username });
  return res.data;
};

export const unregisterEventApi = async (eventId: string, userId: string) => {
  const res = await api.post(`/events/${eventId}/unregister`, { userId });
  return res.data;
};

export const getEventQRCodeApi = async (eventId: string) => {
  const res = await api.get(`/events/${eventId}/qr`);
  return res.data;
};

export const checkInEventApi = async (
  eventId: string,
  qrData: string,
  userId: string
) => {
  const res = await api.post(`/events/${eventId}/check-in`, { qrData, userId });
  return res.data;
};

export const getEventAttendanceApi = async (eventId: string) => {
  const res = await api.get(`/events/${eventId}/attendance`);
  return res.data;
};

export const getRegisteredEventsApi = async (userId: string) => {
  const res = await api.get(`/events/registered/${userId}`);
  return res.data;
};

export const createAppointmentApi = async (data: {
  slotTime_id: string;
  user_id: string;
  consultant_id: string;
  service_id: string;
  dateBooking: string;
  reason: string;
  note?: string;
}) => {
  const res = await api.post('/appointments', data);
  return res.data;
};

// Cập nhật thông tin account
export const updateAccountApi = async (id: string, data: Partial<{ fullName: string; phoneNumber: string }>) => {
  const res = await api.put(`/accounts/${id}`, data);
  return res.data;
};

// Đổi mật khẩu
export const changePasswordApi = async (email: string, password: string, confirmPassword: string) => {
  const res = await api.post(`/accounts/change-password`, { email, password, confirmPassword });
  return res.data;
};

export default api;
