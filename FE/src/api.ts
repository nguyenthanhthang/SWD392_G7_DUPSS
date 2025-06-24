import axios from "axios";

export interface BlogData {
  title: string;
  content: string;
  author: string;
  published: 'draft' | 'published' | 'rejected';
  topics?: string[];
  image?: File | string; // Có thể là File khi upload hoặc URL string khi hiển thị
}

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
  confirmPassword: string,
  fullName: string,
  phoneNumber?: string,
  yearOfBirth?: number,
  gender?: string
) => {
  const res = await api.post("/auth/register", {
    username,
    email,
    password,
    confirmPassword,
    fullName,
    phoneNumber,
    yearOfBirth,
    gender,
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

// Gửi OTP xác thực đăng ký (chỉ dùng cho đăng ký)
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
  slots: { start_time: string; end_time: string }[];
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

// Lấy slot time theo id
export const getSlotTimeByIdApi = async (id: string) => {
  const res = await api.get(`/slot-times/${id}`);
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

export const checkPhoneNumberExistsApi = async (
  phone: string,
  excludeId?: string
) => {
  const res = await api.get(
    `/accounts/check-phone/${phone}` +
      (excludeId ? `?excludeId=${excludeId}` : "")
  );
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
  const res = await api.post("/appointments", data);
  return res.data;
};

// Cập nhật thông tin account
export const updateAccountApi = async (
  id: string,
  data: Partial<{ 
    fullName: string; 
    phoneNumber: string;
    photoUrl: string;
    yearOfBirth: number;
    gender: 'male' | 'female' | 'other';
  }>
) => {
  const res = await api.put(`/accounts/${id}`, data);
  return res.data;
};

// Đổi mật khẩu
export const changePasswordApi = async (
  email: string,
  password: string,
  confirmPassword: string
) => {
  const res = await api.post(`/accounts/change-password`, {
    email,
    password,
    confirmPassword,
  });
  return res.data;
};

export const getAppointmentByUserIdApi = async (userId: string) => {
  const res = await api.get(`/appointments/user/${userId}`);
  return res.data;
};

// Gửi OTP quên mật khẩu
export const sendResetPasswordEmailApi = async (email: string) => {
  const res = await api.post("/auth/send-reset-password-email", { email });
  return res.data;
};

// Blog APIs

export const getAllBlogsApi = async () => {
  const res = await api.get("/blogs");
  return res.data;
};

export const getBlogByIdApi = async (id: string) => {
  try {
    const res = await api.get('/blogs/' + id);
    return res.data;
  } catch (error: unknown) {
    // Xử lý các loại lỗi cụ thể
    if (axios.isAxiosError(error) && error.response) {
      // Server trả về response với status code nằm ngoài range 2xx
      throw new Error(error.response.data.message || 'Không thể tải bài viết');
    } else if (axios.isAxiosError(error) && error.request) {
      // Request được gửi nhưng không nhận được response
      throw new Error('Không thể kết nối đến server');
    } else {
      // Có lỗi khi thiết lập request
      throw new Error('Có lỗi xảy ra khi tải bài viết');
    }
  }
};

export const createBlogApi = async (data: BlogData) => {
  // Nếu có file (data.image là File), gửi FormData
  if (data.image instanceof File) {
    const form = new FormData();
    form.append("title", data.title);
    form.append("content", data.content);
    form.append("author", data.author);
    form.append("published", data.published.toString());
    if (data.topics) form.append("topics", JSON.stringify(data.topics));
    form.append("image", data.image);
    const res = await api.post("/blogs", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } else {
    // Không có file hoặc image là URL, gửi JSON bình thường
    const res = await api.post("/blogs", data);
    return res.data;
  }
};

export const updateBlogApi = async (id: string, data: BlogData) => {
  console.log('updateBlogApi called with:', { id, data }); // Debug log
  
  if (data.image instanceof File) {
    const form = new FormData();
    form.append("title", data.title);
    form.append("content", data.content);
    form.append("author", data.author);
    form.append("published", data.published.toString());
    if (data.topics) form.append("topics", JSON.stringify(data.topics));
    form.append("image", data.image);
    
    console.log('Sending FormData with published:', data.published); // Debug log
    
    const res = await api.put(`/blogs/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } else {
    console.log('Sending JSON with published:', data.published); // Debug log
    
    const res = await api.put(`/blogs/${id}`, data);
    return res.data;
  }
};

export const deleteBlogApi = async (id: string) => {
  const res = await api.delete(`/blogs/${id}`);
  return res.data;
};

export const getBlogsByAuthorApi = async (author: string) => {
  const res = await api.get(`/blogs?author=${encodeURIComponent(author)}`);
  return res.data;
};

export const getBlogsByUserIdApi = async (userId: string) => {
  const res = await api.get(`/blogs/user/${userId}`);
  return res.data;
};

// Lấy consultant bằng accountId
export const getConsultantByAccountIdApi = async (accountId: string) => {
  const res = await api.get(`/consultants/account/${accountId}`);
  return res.data;
};

// Cập nhật thông tin consultant
export const updateConsultantApi = async (
  id: string,
  data: Partial<{ introduction: string; startDateofWork: string }>
) => {
  const res = await api.put(`/consultants/${id}`, data);
  return res.data;
};

// ===== QUIZ APIs =====

// Lấy danh sách các bài quiz
export const getAllQuizzesApi = async (ageGroup?: string) => {
  const params = ageGroup ? `?ageGroup=${ageGroup}` : "";
  const res = await api.get(`/quizzes${params}`);
  return res.data;
};

// Lấy câu hỏi theo quiz và age group
export const getQuizQuestionsApi = async (
  quizId: string,
  ageGroup?: string,
  limit?: number
) => {
  const params = new URLSearchParams();
  if (ageGroup) params.append("ageGroup", ageGroup);
  if (limit) params.append("limit", limit.toString());
  const res = await api.get(
    `/quizzes/${quizId}/questions?${params.toString()}`
  );
  return res.data;
};

// Submit kết quả làm bài quiz
export const submitQuizResultApi = async (data: {
  quizId: string;
  userId?: string;
  sessionId?: string;
  answers: { questionId: string; selectedOption: number }[];
}) => {
  const res = await api.post("/quizzes/quiz-results", data);
  return res.data;
};

// Lấy lịch sử kết quả quiz của user
export const getUserQuizResultsApi = async (
  userId: string,
  limit?: number,
  page?: number
) => {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (page) params.append("page", page.toString());
  const res = await api.get(
    `/quizzes/quiz-results/${userId}?${params.toString()}`
  );
  return res.data;
};

// Lấy chi tiết một kết quả quiz
export const getQuizResultByIdApi = async (resultId: string) => {
  const res = await api.get(`/quizzes/quiz-results/result/${resultId}`);
  return res.data;
};

// ===== SLOT TIME APIs =====

export const getAllSlotTimeApi = async () => {
  const res = await api.get("/slot-times");
  return res.data;
};

// Lấy danh sách tư vấn viên rảnh cho từng khung giờ trong một ngày
export const getAvailableConsultantsByDayApi = async (date: string) => {
  const res = await api.get(`/slot-times/available-by-day/${date}`);
  return res.data;
};

// ===== CERTIFICATE APIs =====
export const getCertificatesByConsultantIdApi = async (consultantId: string) => {
  const res = await api.get(`/certificates/consultant/${consultantId}`);
  return res.data;
};

export const createCertificateApi = async (data: { title: string, type: string, issuedBy: number, issueDate: string, expireDate?: string, description?: string, fileUrl: string, consultant_id: string }) => {
  const res = await api.post('/certificates', data);
  return res.data;
};

export const updateCertificateApi = async (id: string, data: Partial<{ title: string, type: string, issuedBy: number, issueDate: string, expireDate?: string, description?: string, fileUrl: string }>) => {
  const res = await api.put(`/certificates/${id}`, data);
  return res.data;
};

export const deleteCertificateApi = async (id: string) => {
  const res = await api.delete(`/certificates/${id}`);
  return res.data;
};

export const getCertificateByIdApi = async (id: string) => {
  const res = await api.get(`/certificates/${id}`);
  return res.data;
};

// Comment APIs
export const getCommentsApi = async (blogId: string) => {
  const res = await api.get(`/blogs/${blogId}/comments`);
  return res.data;
};

export const addCommentApi = async (blogId: string, data: { userId: string; username: string; content: string }) => {
  const res = await api.post(`/blogs/${blogId}/comments`, data);
  return res.data;
};

export const deleteCommentApi = async (blogId: string, commentId: string, userId: string) => {
  const res = await api.delete(`/blogs/${blogId}/comments/${commentId}`, { data: { userId } });
  return res.data;
};

export const getAppointmentByConsultantIdApi = async (consultantId: string) => {
  const res = await api.get(`/appointments/consultant/${consultantId}`);
  return res.data;
};

export const getServiceByIdApi = async (id: string) => {
  const res = await api.get(`/services/${id}`);
  return res.data;
};

// Feedback APIs
export const createFeedbackApi = async (data: {
  account_id: string;
  appointment_id: string;
  service_id: string;
  rating: number;
  comment: string;
}) => {
  const res = await api.post("/feedback", data);
  return res.data;
};

export const getFeedbackByAccountIdApi = async (accountId: string) => {
  const res = await api.get(`/feedback/account/${accountId}`);
  return res.data;
};

export const getFeedbackByAppointmentIdApi = async (appointmentId: string) => {
  const res = await api.get(`/feedback/appointment/${appointmentId}`);
  return res.data;
};

export const getFeedbackByServiceIdApi = async (serviceId: string) => {
  const res = await api.get(`/feedback/service/${serviceId}`);
  return res.data;
};

export const getFeedbackByIdApi = async (id: string) => {
  const res = await api.get(`/feedback/${id}`);
  return res.data;
};

// Service Rating APIs
export const getServiceRatingApi = async (serviceId: string) => {
  const res = await api.get(`/services/${serviceId}/rating`);
  return res.data;
};

export const updateServiceRatingApi = async (serviceId: string) => {
  const res = await api.post(`/services/${serviceId}/update-rating`);
  return res.data;
};

// Feedback với Rating APIs
export const createFeedbackWithRatingApi = async (data: {
  account_id: string;
  appointment_id: string;
  service_id: string;
  rating: number; // số từ 1-5
  comment: string;
}) => {
  const res = await api.post('/feedbacks', data);
  // Sau khi tạo feedback, cập nhật lại rating cho service
  await updateServiceRatingApi(data.service_id);
  return res.data;
};

export const getAllFeedbacksApi = async () => {
  const res = await api.get('/feedbacks');
  return res.data;
};

export const updateFeedbackStatusApi = async (id: string, status: 'approved' | 'rejected') => {
  const res = await api.put(`/feedbacks/${id}/status`, { status });
  return res.data;
};

// ===== PAYMENT APIs =====
export const createMomoPaymentApi = async (data: { amount: number; orderInfo: string; }) => {
  const res = await api.post('/payment/momo/create-payment', data);
  return res.data;
};

export const createVnpayPaymentApi = async (data: { amount: number; orderInfo: string; orderId: string; }) => {
  const res = await api.post('/payment/vnpay/create-payment', data);
  return res.data;
};

export const getAppointmentByIdApi = async (id: string) => {
  const res = await api.get(`/appointments/${id}`);
  return res.data;
};

// ===== REPORT APIs =====
export const createReportApi = async (data: {
  account_id: string;
  appointment_id: string;
  consultant_id: string;
  nameOfPatient: string;
  age: number;
  gender: string;
  condition: string;
  notes?: string;
  recommendations?: string;
  status?: string;
}) => {
  const res = await api.post("/reports", data);
  return res.data;
};

export const getReportByAppointmentIdApi = async (appointmentId: string) => {
  const res = await api.get(`/reports/appointment/${appointmentId}`);
  return res.data;
};

export const getReportByConsultantIdApi = async (consultantId: string) => {
  const res = await api.get(`/reports/consultant/${consultantId}`);
  return res.data;
};

export const getReportByIdApi = async (reportId: string) => {
  const res = await api.get(`/reports/${reportId}`);
  return res.data;
};

export const updateReportApi = async (reportId: string, data: {
  nameOfPatient?: string;
  age?: number;
  gender?: string;
  condition?: string;
  notes?: string;
  recommendations?: string;
  status?: string;
}) => {
  const res = await api.put(`/reports/${reportId}`, data);
  return res.data;
};

export const updateAppointmentStatusApi = async (id: string, status: string) => {
  const res = await api.put(`/appointments/status/${id}`, { status });
  return res.data;
};

export const createPaymentApi = async (data: {
  accountId: string;
  appointmentId: string;
  date: string;
  description: string;
  paymentLinkId: string;
  totalPrice: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'paypal' | 'momo' | 'vnpay' | 'cash' | 'other';
}) => {
  const res = await api.post('/payment', data);
  return res.data;
};

export const deleteAppointmentApi = async (id: string) => {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
};

export default api;