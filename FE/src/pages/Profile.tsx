import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  getAccountByIdApi,
  updateAccountApi,
  changePasswordApi,
  sendResetPasswordEmailApi,
  getBlogsByUserIdApi,
  updateBlogApi,
  getRegisteredEventsApi,
  unregisterEventApi,
} from "../api";
import whaleLogo from "../assets/whale.png";
import AppointmentsPage from "./Appointments";
import type { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import BlogDetailView from "../components/blog/BlogDetailView";
import CreateBlogForm from "../components/blog/CreateBlogForm";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import PaymentHistory from "./PaymentHistory";
import { FiMessageCircle, FiCheckCircle } from "react-icons/fi";

interface User {
  _id?: string;
  username?: string;
  email?: string;
  password?: string;
  photoUrl?: string;
  fullName?: string;
  phoneNumber?: string;
  role?: "consultant" | "customer";
  gender?: "male" | "female" | "other";
  yearOfBirth?: number;
  isVerified?: boolean;
  isDisabled?: boolean;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  image?: string;
  thumbnail?: string;
  topics?: string[];
  published: "draft" | "published" | "rejected";
  comments: {
    userId: string;
    username: string;
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
  anDanh?: boolean;
  rejectionReason?: string;
}

// Định nghĩa type cho sponsor (có thể đặt ở đầu file hoặc gần interface Event)
type Sponsor = {
  logo: string;
};

// Định nghĩa type Event (tối thiểu các trường cần dùng)
type Event = {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  location: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isCancelled?: boolean;
  sponsors?: Sponsor[];
  qrCode?: string;
  image?: string;
  checkedInAt?: string;
};

// Định nghĩa interface EventFeedback nếu chưa có
interface EventFeedback {
  _id: string;
  userId: {
    _id: string;
    fullName?: string;
    photoUrl?: string;
  };
  eventId: string;
  content: string;
  rating: number;
  createdAt?: string;
}

const menuTabs = [
  { key: "profile", label: "Hồ sơ người dùng" },
  { key: "blogs", label: "Bài viết" },
  { key: "Appointments", label: "Lịch hẹn" },
  { key: "payments", label: "Thanh toán" },
  { key: "registeredEvents", label: "Sự kiện đã đăng ký" },
];

export default function Profile() {
  const location = useLocation();
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<User>({});
  const [editMode, setEditMode] = useState(false);
  const [fieldError, setFieldError] = useState<{
    fullName?: string;
    phoneNumber?: string;
  }>({});
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdStep, setPwdStep] = useState<"email" | "otp" | "newpass">("email");
  const [pwdEmail, setPwdEmail] = useState("");
  const [pwdOtp, setPwdOtp] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogDangXem, setBlogDangXem] = useState<Blog | null>(null);
  const [modalBlog, setModalBlog] = useState(false);
  const [blogDangSua, setBlogDangSua] = useState<Blog | null>(null);
  const [modalEdit, setModalEdit] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKeyword, setFilterKeyword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: authUser } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [showQR, setShowQR] = useState<{ open: boolean; qr?: string } | null>(
    null
  );
  const [eventFilterStatus, setEventFilterStatus] = useState("all");
  const [eventFilterKeyword, setEventFilterKeyword] = useState("");
  const filteredEvents = registeredEvents.filter((ev) => {
    const matchStatus =
      eventFilterStatus === "all" || ev.status === eventFilterStatus;
    const matchKeyword = ev.title
      .toLowerCase()
      .includes(eventFilterKeyword.toLowerCase());
    return matchStatus && matchKeyword;
  });
  const [eventDangXem, setEventDangXem] = useState<Event | null>(null);
  const [modalEvent, setModalEvent] = useState(false);
  const [eventFeedbacks, setEventFeedbacks] = useState<
    Record<string, EventFeedback | null>
  >({});
  const [feedbackLoading, setFeedbackLoading] = useState<
    Record<string, boolean>
  >({});
  const [feedbackForm, setFeedbackForm] = useState<
    Record<string, { content: string; rating: number }>
  >({});

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
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

  // Tự động chuyển tab nếu có query ?tab=payments
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && menuTabs.some((t) => t.key === tabParam)) {
      setTab(tabParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (user?._id) {
      getBlogsByUserIdApi(user._id)
        .then(setBlogs)
        .catch(() => setBlogs([]));
    }
  }, [user?._id]);

  const handleEdit = () => setEditMode(true);

  const validateProfile = async () => {
    if (!user?._id) return false;
    if (!editData.fullName) {
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!user?._id) return;
    if (!(await validateProfile())) return;
    try {
      await updateAccountApi(user._id, {
        fullName: editData.fullName,
        phoneNumber: editData.phoneNumber,
        gender: editData.gender,
        yearOfBirth: editData.yearOfBirth,
      });
      const updated = await getAccountByIdApi(user._id);
      setUser(updated);
      setEditData(updated);
      setEditMode(false);
      setFieldError({}); // Clear any previous errors
    } catch (error: unknown) {
      // Extract error message from response
      const errorMessage = (error as any).response?.data?.message;
      if (errorMessage?.toLowerCase().includes("số điện thoại")) {
        setFieldError((prev) => ({
          ...prev,
          phoneNumber: errorMessage,
        }));
      }
    }
  };

  const handleSendOtp = async () => {
    setPwdError("");
    setPwdLoading(true);
    try {
      await sendResetPasswordEmailApi(pwdEmail);
      setPwdStep("otp");
      setPwdOtp(""); // Clear OTP when resending
      setPwdError(""); // Clear any previous errors
    } catch (error) {
      setPwdError("Không gửi được OTP, kiểm tra email!");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setPwdError("");
    setPwdLoading(true);
    try {
      const response = await fetch("/api/auth/check-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifyCode: pwdOtp }),
      });

      if (!response.ok) {
        throw new Error("OTP không đúng hoặc đã hết hạn!");
      }

      setPwdStep("newpass");
    } catch (error) {
      setPwdError("OTP không đúng hoặc đã hết hạn!");
      setPwdOtp(""); // Clear OTP input when wrong
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdError("");
    setPwdLoading(true);
    try {
      if (!user?.email) throw new Error("Không tìm thấy email người dùng");
      await changePasswordApi(user.email, pwdNew, pwdConfirm, pwdOtp);
      setShowPwdModal(false);
      setPwdStep("email");
      setPwdEmail("");
      setPwdOtp("");
      setPwdNew("");
      setPwdConfirm("");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setPwdError(
        axiosErr?.response?.data?.message || "Đổi mật khẩu thất bại!"
      );
    }
    setPwdLoading(false);
  };

  // Hàm lọc blog
  const filteredBlogs = blogs.filter((blog) => {
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && blog.published === "published") ||
      (filterStatus === "pending" && blog.published === "draft") ||
      (filterStatus === "rejected" && blog.published === "rejected");
    const matchKeyword = blog.title
      .toLowerCase()
      .includes(filterKeyword.toLowerCase());
    return matchStatus && matchKeyword;
  });

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Sử dụng API upload của backend với progress tracking
      const response = await axios.post(
        "https://swd392-g7-dupss.onrender.com/api/uploads/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            // setUploadProgress(progress); // XÓA biến uploadProgress và setUploadProgress không dùng
          },
        }
      );

      if (response.data && response.data.imageUrl) {
        // Cập nhật avatar URL trong database
        if (user?._id) {
          await updateAccountApi(user._id, {
            photoUrl: response.data.imageUrl,
          });
          // Cập nhật user ngay lập tức
          const updated = await getAccountByIdApi(user._id);
          setUser(updated);
          setEditData(updated);
        }

        toast.success("Cập nhật ảnh đại diện thành công!", {
          position: "top-center",
          autoClose: 2500,
        });
      } else {
        toast.error("Không nhận được URL ảnh từ server!", {
          position: "top-center",
          autoClose: 2500,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.", {
        position: "top-center",
        autoClose: 2500,
      });
    } finally {
      // setUploadProgress(0); // XÓA biến uploadProgress và setUploadProgress không dùng
    }
  };

  const fetchRegisteredEvents = async () => {
    if (!authUser) return;
    try {
      const data = await getRegisteredEventsApi(authUser._id);
      setRegisteredEvents(data);
    } catch {
      // handle error if needed
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchRegisteredEvents();
    }
  }, [authUser]);

  const handleUnregister = async (
    eventId: string,
    registrationEndDate: string,
    userId: string = "",
    event: Event
  ) => {
    if (!authUser) return;

    // Kiểm tra thời gian đăng ký
    const now = new Date();
    const regEndDate = new Date(registrationEndDate);

    if (now > regEndDate) {
      alert("Đã quá thời gian cho phép hủy đăng ký!");
      return;
    }

    try {
      await unregisterEventApi(eventId, authUser._id);
      // Gọi lại API để lấy danh sách sự kiện đã đăng ký mới nhất
      await fetchRegisteredEvents();
      alert("Hủy đăng ký thành công!");
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message || "Không thể hủy đăng ký!";
      alert(message);
    }
  };

  // Hàm lấy feedback của user cho từng event
  const fetchEventFeedback = async (eventId: string) => {
    setFeedbackLoading((prev) => ({ ...prev, [eventId]: true }));
    try {
      const res = await axios.get(`/api/event-feedback/${eventId}`);
      // Lấy feedback của user hiện tại (nếu có)
      const userId = authUser?._id;
      const fb = Array.isArray(res.data)
        ? res.data.find((f: any) => f.userId._id === userId)
        : null;
      setEventFeedbacks((prev) => ({ ...prev, [eventId]: fb || null }));
    } catch {
      setEventFeedbacks((prev) => ({ ...prev, [eventId]: null }));
    } finally {
      setFeedbackLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  // Khi load danh sách event, fetch feedback cho từng event
  useEffect(() => {
    if (authUser && registeredEvents.length > 0) {
      registeredEvents.forEach((ev) => {
        fetchEventFeedback(ev._id);
      });
    }
    // eslint-disable-next-line
  }, [authUser, registeredEvents.length]);

  // Hàm gửi feedback
  const handleSendFeedback = async (eventId: string) => {
    const form = feedbackForm[eventId];
    console.log("[DEBUG] Gửi feedback:", eventId, form);
    if (!form || !form.content || !form.rating) return;
    setFeedbackLoading((prev) => ({ ...prev, [eventId]: true }));
    try {
      await axios.post(
        "/api/event-feedback",
        {
          eventId,
          content: form.content,
          rating: form.rating,
          userId: authUser?._id, // Truyền userId vào body
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Gửi feedback thành công!");
      setFeedbackForm((prev) => ({
        ...prev,
        [eventId]: { content: "", rating: 5 },
      }));
      fetchEventFeedback(eventId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể gửi feedback");
    } finally {
      setFeedbackLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#DBE8FA] flex flex-col items-center py-4 px-2 relative overflow-x-hidden">
      {/* Bóng tròn 2 màu chủ đạo */}
      <div className="absolute top-10 left-[-80px] w-60 h-60 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-1/3 left-[-100px] w-72 h-72 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute bottom-20 left-[-60px] w-44 h-44 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-20 right-[-80px] w-60 h-60 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-1/2 right-[-100px] w-72 h-72 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute bottom-10 right-[-60px] w-44 h-44 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="bg-white rounded-3xl shadow-sm flex flex-col w-full max-w-6xl overflow-hidden relative">
        {/* Main content container */}
        <div className="flex flex-row w-full">
          {/* Sidebar */}
          <div className="w-64 py-10 px-6 bg-[#f7fafd]">
            {/* Nút quay về trang chủ nằm trong menu */}
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 font-medium hover:underline bg-white rounded-lg px-3 py-1.5 shadow-sm border border-blue-100 mb-4"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Trang chủ
            </Link>
            <nav className="flex flex-col gap-2">
              {menuTabs.map((m) =>
                m.key === "Appointments" ? (
                  <button
                    key={m.key}
                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      tab === m.key
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-blue-50"
                    }`}
                    onClick={() => setTab(m.key)}
                  >
                    {m.label}
                  </button>
                ) : m.key === "payments" ? (
                  <button
                    key={m.key}
                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      tab === m.key
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-blue-50"
                    }`}
                    onClick={() => setTab(m.key)}
                  >
                    {m.label}
                  </button>
                ) : (
                  <button
                    key={m.key}
                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      tab === m.key
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-blue-50"
                    }`}
                    onClick={() => setTab(m.key)}
                  >
                    {m.label}
                  </button>
                )
              )}
              <div className="mt-auto pt-8 border-t border-gray-200 mt-8">
                <Link
                  to="/login"
                  className="text-red-500 font-medium hover:underline flex items-center gap-2 px-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 10-2 0v4a1 1 0 102 0V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Đăng xuất
                </Link>
              </div>
            </nav>
          </div>
          {/* Main content */}
          <div className="flex-1">
            <div className="max-w-4xl mx-auto">
              {tab === "profile" && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Phần Avatar */}
                    <div className="flex flex-col items-center space-y-4 w-full md:w-1/3">
                      <div className="relative w-48 h-48">
                        <img
                          src={user?.photoUrl || whaleLogo}
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-full border-4 border-blue-500"
                        />
                        <button
                          onClick={handleAvatarClick}
                          className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-center">
                        {user?.fullName}
                      </h2>
                      <p className="text-gray-600 text-center">
                        {user?.role === "consultant"
                          ? "Tư vấn viên"
                          : "Khách hàng"}
                      </p>
                    </div>

                    {/* Phần thông tin */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">
                          Thông tin cá nhân
                        </h3>
                        <div className="flex items-center gap-4">
                          {!editMode ? (
                            <button
                              onClick={handleEdit}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Chỉnh sửa
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditMode(false);
                                  setEditData(user || {});
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Lưu thay đổi
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Form fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Họ và tên
                          </label>
                          <input
                            type="text"
                            value={editData.fullName || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                fullName: e.target.value,
                              })
                            }
                            disabled={!editMode}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              editMode
                                ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                : "bg-gray-50 border-gray-200"
                            } transition-colors`}
                            placeholder="Nhập họ và tên"
                          />
                          {fieldError.fullName && (
                            <p className="text-red-500 text-sm mt-1">
                              {fieldError.fullName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editData.email || ""}
                            disabled
                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            value={editData.phoneNumber || ""}
                            onChange={(e) => {
                              setEditData({
                                ...editData,
                                phoneNumber: e.target.value,
                              });
                              // Clear error when user starts typing
                              if (fieldError.phoneNumber) {
                                setFieldError((prev) => ({
                                  ...prev,
                                  phoneNumber: undefined,
                                }));
                              }
                            }}
                            disabled={!editMode}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              fieldError.phoneNumber
                                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                                : editMode
                                ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                : "bg-gray-50 border-gray-200"
                            } transition-colors`}
                            placeholder="0xxxxxxxxx"
                          />
                          {fieldError.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1">
                              {fieldError.phoneNumber}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Giới tính
                          </label>
                          <select
                            value={editData.gender || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                gender: e.target.value as
                                  | "male"
                                  | "female"
                                  | "other",
                              })
                            }
                            disabled={!editMode}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              editMode
                                ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                : "bg-gray-50 border-gray-200"
                            } transition-colors`}
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Năm sinh
                          </label>
                          <input
                            type="number"
                            value={editData.yearOfBirth || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                yearOfBirth: parseInt(e.target.value),
                              })
                            }
                            disabled={!editMode}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              editMode
                                ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                : "bg-gray-50 border-gray-200"
                            } transition-colors`}
                            min="1900"
                            max={new Date().getFullYear()}
                            placeholder="Nhập năm sinh"
                          />
                        </div>
                      </div>

                      {/* Nút đổi mật khẩu */}
                      <div className="col-span-2">
                        <button
                          onClick={() => setShowPwdModal(true)}
                          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Đổi mật khẩu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {tab === "blogs" && (
                <div className="p-7">
                  <div className="font-semibold text-gray-700 mb-4 text-lg">
                    Bài viết của bạn
                  </div>
                  {/* Filter */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="rounded-lg border border-sky-100 px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="all">Tất cả</option>
                      <option value="published">Đã xuất bản</option>
                      <option value="pending">Chưa duyệt</option>
                      <option value="rejected">Đã từ chối</option>
                    </select>
                    <input
                      type="text"
                      value={filterKeyword}
                      onChange={(e) => setFilterKeyword(e.target.value)}
                      placeholder="Tìm theo tiêu đề..."
                      className="rounded-lg border border-sky-100 px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 w-full md:w-64"
                    />
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {/* Đã xuất bản */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        filterStatus === "published"
                          ? "border-green-500 ring-2 ring-green-200"
                          : "border-gray-100"
                      }`}
                      onClick={() => setFilterStatus("published")}
                    >
                      <div className="p-2.5 bg-green-50 rounded-full mb-2 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Đã xuất bản</p>
                      <p className="text-xl font-bold text-gray-900">
                        {
                          blogs.filter((blog) => blog.published === "published")
                            .length
                        }
                      </p>
                    </div>

                    {/* Chưa duyệt */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        filterStatus === "pending"
                          ? "border-yellow-500 ring-2 ring-yellow-200"
                          : "border-gray-100"
                      }`}
                      onClick={() => setFilterStatus("pending")}
                    >
                      <div className="p-2.5 bg-yellow-50 rounded-full mb-2 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-yellow-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Chưa duyệt</p>
                      <p className="text-xl font-bold text-gray-900">
                        {
                          blogs.filter((blog) => blog.published === "draft")
                            .length
                        }
                      </p>
                    </div>

                    {/* Đã từ chối */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        filterStatus === "rejected"
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-100"
                      }`}
                      onClick={() => setFilterStatus("rejected")}
                    >
                      <div className="p-2.5 bg-red-50 rounded-full mb-2 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Đã từ chối</p>
                      <p className="text-xl font-bold text-gray-900">
                        {
                          blogs.filter((blog) => blog.published === "rejected")
                            .length
                        }
                      </p>
                    </div>
                  </div>

                  {/* Danh sách bài viết */}
                  <div>
                    <div className="font-semibold mb-2 text-sky-700">
                      {filterStatus === "published"
                        ? "Bài viết đã xuất bản"
                        : filterStatus === "pending"
                        ? "Bài viết chưa duyệt"
                        : filterStatus === "rejected"
                        ? "Bài viết bị từ chối"
                        : "Tất cả bài viết"}
                    </div>

                    {filteredBlogs.length === 0 ? (
                      <div className="text-gray-500 italic">
                        Không tìm thấy bài viết nào.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredBlogs.map((blog) => (
                          <div
                            key={blog._id}
                            className={`bg-gradient-to-r from-sky-50 via-cyan-50 to-white hover:from-sky-100 transition rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm cursor-pointer border border-sky-100`}
                          >
                            <div>
                              <div className="font-medium text-base text-gray-800">
                                {blog.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <svg
                                  className="w-3 h-3 text-sky-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {new Date(blog.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Tác giả:{" "}
                                {(blog.author === user?.fullName ||
                                  blog.author === user?.username) &&
                                blog.anDanh
                                  ? "Ẩn danh"
                                  : blog.author}
                              </div>
                              <div
                                className={`text-xs ${
                                  blog.published === "published"
                                    ? "text-green-700"
                                    : "text-red-700"
                                } font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${
                                  blog.published === "published"
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                                } border`}
                              >
                                {blog.published === "published"
                                  ? "Đã xuất bản"
                                  : blog.published === "draft"
                                  ? "Chưa duyệt"
                                  : "Đã từ chối"}
                              </div>
                              {blog.published === "rejected" &&
                                blog.rejectionReason && (
                                  <div className="text-xs text-red-600 mt-1">
                                    Lý do từ chối: {blog.rejectionReason}
                                  </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setBlogDangXem(blog);
                                  setModalBlog(true);
                                }}
                                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                Xem chi tiết
                              </button>
                              {blog.published !== "rejected" &&
                                blog.published !== "published" && (
                                  <button
                                    onClick={() => {
                                      setBlogDangSua(blog);
                                      setModalEdit(true);
                                    }}
                                    className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    Chỉnh sửa
                                  </button>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tab === "Appointments" && (
                <div className="w-full">
                  <AppointmentsPage />
                </div>
              )}
              {tab === "payments" && (
                <div className="w-full">
                  <PaymentHistory />
                </div>
              )}
              {tab === "registeredEvents" && (
                <div className="p-7">
                  <div className="font-semibold text-sky-700 mb-4 text-lg">
                    Sự kiện đã đăng ký
                  </div>
                  {/* Filter */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                    <select
                      value={eventFilterStatus}
                      onChange={(e) => setEventFilterStatus(e.target.value)}
                      className="rounded-lg border border-sky-100 px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="all">Tất cả</option>
                      <option value="upcoming">Sắp diễn ra</option>
                      <option value="ongoing">Đang diễn ra</option>
                      <option value="completed">Đã kết thúc</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                    <input
                      type="text"
                      value={eventFilterKeyword}
                      onChange={(e) => setEventFilterKeyword(e.target.value)}
                      placeholder="Tìm theo tên sự kiện..."
                      className="rounded-lg border border-sky-100 px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 w-full md:w-64"
                    />
                  </div>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Sắp diễn ra */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        eventFilterStatus === "upcoming"
                          ? "border-sky-500 ring-2 ring-sky-200"
                          : "border-gray-100"
                      }`}
                      onClick={() => setEventFilterStatus("upcoming")}
                    >
                      <div className="p-2.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-full mb-2 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-sky-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Sắp diễn ra</p>
                      <p className="text-xl font-bold text-gray-900">
                        {
                          registeredEvents.filter(
                            (ev) => ev.status === "upcoming"
                          ).length
                        }
                      </p>
                    </div>
                    {/* Đang diễn ra */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        eventFilterStatus === "ongoing"
                          ? "border-green-500 ring-2 ring-green-200"
                          : "border-gray-100"
                      }`}
                      onClick={() => setEventFilterStatus("ongoing")}
                    >
                      <div className="p-2.5 bg-gradient-to-r from-green-50 to-green-100 rounded-full mb-2 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Đang diễn ra</p>
                      <p className="text-xl font-bold text-gray-900">
                        {
                          registeredEvents.filter(
                            (ev) => ev.status === "ongoing"
                          ).length
                        }
                      </p>
                    </div>
                    {/* Đã kết thúc */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        eventFilterStatus === "completed"
                          ? "border-gray-500 ring-2 ring-gray-200"
                          : "border-gray-100"
                      }`}
                      onClick={() => setEventFilterStatus("completed")}
                    >
                      <div className="p-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full mb-2 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Đã kết thúc</p>
                      <p className="text-xl font-bold text-gray-900">
                        {
                          registeredEvents.filter(
                            (ev) => ev.status === "completed"
                          ).length
                        }
                      </p>
                    </div>
                    {/* Đã hủy */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        eventFilterStatus === "cancelled"
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-100"
                      }`}
                      onClick={() => setEventFilterStatus("cancelled")}
                    >
                      <div className="p-2.5 bg-gradient-to-r from-red-50 to-red-100 rounded-full mb-2 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Đã hủy</p>
                      <p className="text-xl font-bold text-gray-900">
                        {
                          registeredEvents.filter(
                            (ev) => ev.status === "cancelled"
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                  {/* Danh sách sự kiện */}
                  <div>
                    <div className="font-semibold mb-2 text-sky-700">
                      {eventFilterStatus === "upcoming"
                        ? "Sự kiện sắp diễn ra"
                        : eventFilterStatus === "ongoing"
                        ? "Sự kiện đang diễn ra"
                        : eventFilterStatus === "completed"
                        ? "Sự kiện đã kết thúc"
                        : eventFilterStatus === "cancelled"
                        ? "Sự kiện đã hủy"
                        : "Tất cả sự kiện"}
                    </div>
                    {filteredEvents.length === 0 ? (
                      <div className="text-gray-500 italic">
                        Bạn chưa đăng ký sự kiện nào.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredEvents.map((event) => (
                          <div
                            key={event._id}
                            className="bg-gradient-to-r from-sky-50 via-cyan-50 to-white hover:from-sky-100 transition rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm cursor-pointer border border-sky-100"
                          >
                            <div>
                              <div className="font-medium text-base text-gray-800">
                                {event.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <svg
                                  className="w-3 h-3 text-sky-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {new Date(event.startDate).toLocaleDateString(
                                  "vi-VN"
                                )}{" "}
                                -{" "}
                                {new Date(event.endDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Địa điểm: {event.location}
                              </div>
                              <div
                                className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full border ${
                                  event.status === "upcoming"
                                    ? "bg-sky-50 border-sky-200 text-sky-700"
                                    : event.status === "ongoing"
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : event.status === "completed"
                                    ? "bg-gray-50 border-gray-200 text-gray-700"
                                    : "bg-red-50 border-red-200 text-red-700"
                                }`}
                              >
                                {event.status === "upcoming"
                                  ? "Sắp diễn ra"
                                  : event.status === "ongoing"
                                  ? "Đang diễn ra"
                                  : event.status === "completed"
                                  ? "Đã kết thúc"
                                  : "Đã hủy"}
                              </div>
                              {event.sponsors && event.sponsors.length > 0 && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    Nhà tài trợ:
                                  </span>
                                  {event.sponsors.map((s, idx) => (
                                    <img
                                      key={idx}
                                      src={s.logo}
                                      alt="sponsor"
                                      className="w-6 h-6 object-contain rounded-full border border-gray-200"
                                    />
                                  ))}
                                </div>
                              )}
                              {event.qrCode && (
                                <div className="mt-2">
                                  <img
                                    src={event.qrCode}
                                    alt="QR code"
                                    className="w-20 h-20 object-contain border border-gray-200 rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setEventDangXem(event);
                                  setModalEvent(true);
                                }}
                                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                Xem chi tiết
                              </button>
                              {event.status === "upcoming" &&
                                (event.isCancelled ? (
                                  <button
                                    disabled
                                    className="px-3 py-1.5 bg-gray-200 text-gray-500 border border-gray-200 rounded-lg text-sm font-medium cursor-not-allowed"
                                  >
                                    Đã hủy đăng ký
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleUnregister(
                                        event._id,
                                        event.registrationEndDate,
                                        user?._id || "",
                                        event
                                      )
                                    }
                                    className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    Hủy đăng ký
                                  </button>
                                ))}
                            </div>
                            {/* Feedback cho event đã check-in */}
                            {event.status === "completed" &&
                              event.checkedInAt && (
                                <div className="mt-2">
                                  {feedbackLoading[event._id] ? (
                                    <div className="text-xs text-gray-400 italic">
                                      Đang tải feedback...
                                    </div>
                                  ) : eventFeedbacks[event._id] ? (
                                    <div className="bg-green-50 border border-green-200 rounded-xl shadow p-4 flex flex-col items-start max-w-md">
                                      <div className="flex items-center gap-2 mb-1">
                                        <FiCheckCircle className="text-green-500 text-xl" />
                                        <span className="font-semibold text-green-700">
                                          Bạn đã gửi feedback
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <span
                                            key={star}
                                            className={
                                              star <=
                                              eventFeedbacks[event._id]!.rating
                                                ? "text-yellow-400 text-xl"
                                                : "text-gray-300 text-xl"
                                            }
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <div className="text-gray-700 mb-1 italic">
                                        "{eventFeedbacks[event._id]!.content}"
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {new Date(
                                          eventFeedbacks[event._id]!.createdAt!
                                        ).toLocaleString()}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-white rounded-xl shadow-md border border-sky-100 p-4 max-w-md">
                                      <div className="font-semibold text-sky-700 mb-2 flex items-center gap-2">
                                        <FiMessageCircle className="text-sky-500" />{" "}
                                        Gửi feedback cho sự kiện này
                                      </div>
                                      <form
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          handleSendFeedback(event._id);
                                        }}
                                      >
                                        <div className="flex items-center gap-2 mb-2">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              type="button"
                                              key={star}
                                              className={
                                                (star <=
                                                (feedbackForm[event._id]
                                                  ?.rating || 5)
                                                  ? "text-yellow-400"
                                                  : "text-gray-300") +
                                                " text-2xl transition-transform transform hover:scale-125 focus:outline-none"
                                              }
                                              onClick={() =>
                                                setFeedbackForm((prev) => ({
                                                  ...prev,
                                                  [event._id]: {
                                                    ...prev[event._id],
                                                    rating: star,
                                                    content:
                                                      prev[event._id]
                                                        ?.content || "",
                                                  },
                                                }))
                                              }
                                            >
                                              ★
                                            </button>
                                          ))}
                                        </div>
                                        <textarea
                                          className="w-full border rounded p-2 text-sm mb-2 focus:ring-2 focus:ring-sky-200"
                                          rows={2}
                                          placeholder="Cảm nhận của bạn về sự kiện..."
                                          value={
                                            feedbackForm[event._id]?.content ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            setFeedbackForm((prev) => ({
                                              ...prev,
                                              [event._id]: {
                                                ...prev[event._id],
                                                content: e.target.value,
                                                rating:
                                                  prev[event._id]?.rating || 5,
                                              },
                                            }))
                                          }
                                          required
                                        />
                                        <button
                                          type="submit"
                                          className="px-4 py-1.5 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors text-sm shadow"
                                          disabled={feedbackLoading[event._id]}
                                        >
                                          {feedbackLoading[event._id]
                                            ? "Đang gửi..."
                                            : "Gửi feedback"}
                                        </button>
                                      </form>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="w-full h-40 mt-12 relative">
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              className="w-full"
            >
              <path
                fill="#DBE8FA"
                fillOpacity="1"
                d="M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,128C672,139,768,181,864,176C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
            <img
              src={whaleLogo}
              alt="Whale decoration"
              className="absolute right-16 bottom-4 w-32 h-auto opacity-80"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
        </div>
      </div>
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Đổi mật khẩu</h3>
              <button
                onClick={() => {
                  setShowPwdModal(false);
                  setPwdStep("email");
                  setPwdEmail("");
                  setPwdOtp("");
                  setPwdNew("");
                  setPwdConfirm("");
                  setPwdError("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Email Step */}
            {pwdStep === "email" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email xác thực
                  </label>
                  <input
                    type="email"
                    value={pwdEmail}
                    onChange={(e) => setPwdEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                    placeholder="Nhập email của bạn"
                    disabled={pwdLoading}
                  />
                </div>
                {pwdError && <p className="text-red-500 text-sm">{pwdError}</p>}
                <button
                  onClick={handleSendOtp}
                  disabled={pwdLoading || !pwdEmail}
                  className={`w-full py-2 rounded-lg font-medium ${
                    pwdLoading || !pwdEmail
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {pwdLoading ? "Đang gửi..." : "Gửi mã OTP"}
                </button>
              </div>
            )}

            {/* OTP Step */}
            {pwdStep === "otp" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    value={pwdOtp}
                    onChange={(e) => {
                      setPwdOtp(e.target.value);
                      if (pwdError) setPwdError(""); // Clear error when user types
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 ${
                      pwdError ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập mã OTP"
                    disabled={pwdLoading}
                  />
                </div>
                {pwdError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-500 text-sm">{pwdError}</p>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={pwdLoading || !pwdOtp}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      pwdLoading || !pwdOtp
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {pwdLoading ? "Đang xác thực..." : "Xác nhận"}
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={pwdLoading}
                    className={`px-4 py-2 border rounded-lg ${
                      pwdLoading
                        ? "border-gray-300 text-gray-300 cursor-not-allowed"
                        : "border-blue-500 text-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    Gửi lại OTP
                  </button>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Không nhận được mã? Bấm "Gửi lại OTP"
                </p>
              </div>
            )}

            {/* New Password Step */}
            {pwdStep === "newpass" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPwdNew ? "text" : "password"}
                      value={pwdNew}
                      onChange={(e) => setPwdNew(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                      placeholder="Nhập mật khẩu mới"
                      disabled={pwdLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdNew(!showPwdNew)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPwdNew ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPwdConfirm ? "text" : "password"}
                      value={pwdConfirm}
                      onChange={(e) => setPwdConfirm(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                      placeholder="Nhập lại mật khẩu mới"
                      disabled={pwdLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPwdConfirm ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
                {pwdError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-500 text-sm">{pwdError}</p>
                  </div>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={pwdLoading || !pwdNew || !pwdConfirm}
                  className={`w-full py-2 rounded-lg font-medium ${
                    pwdLoading || !pwdNew || !pwdConfirm
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {pwdLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal xem chi tiết blog */}
      {modalBlog && blogDangXem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <BlogDetailView
              blog={{
                ...blogDangXem!,
                authorId: {
                  _id: user?._id || "",
                  fullName: user?.fullName || "",
                  username: user?.username || "",
                },
                anDanh: !!blogDangXem?.anDanh,
              }}
              onClose={() => setModalBlog(false)}
            />
          </div>
        </div>
      )}
      {/* Modal chỉnh sửa blog */}
      {modalEdit && blogDangSua && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <CreateBlogForm
              initialData={{
                title: blogDangSua.title,
                content: blogDangSua.content,
                authorId: user?._id || "",
                topics: blogDangSua.topics?.join(", ") || "",
                image: blogDangSua.image || "",
                published: blogDangSua.published,
                anDanh: blogDangSua.anDanh,
              }}
              onCancel={() => setModalEdit(false)}
              onSuccess={() => {
                setModalEdit(false);
                setBlogDangSua(null);
                if (authUser?._id)
                  getBlogsByUserIdApi(authUser._id).then(setBlogs);
              }}
              onSubmit={async (data) => {
                if (blogDangSua.published === "published") {
                  alert("Không thể chỉnh sửa bài viết đã xuất bản.");
                  return;
                }
                const dataUpdate = { ...data };
                await updateBlogApi(blogDangSua._id, dataUpdate);
              }}
            />
          </div>
        </div>
      )}
      {/* Modal xem chi tiết sự kiện đã đăng ký */}
      {modalEvent && eventDangXem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative p-6">
            <button
              onClick={() => setModalEvent(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {eventDangXem.title}
            </h3>
            <div className="space-y-2">
              <div>
                <b>Thời gian:</b>{" "}
                {new Date(eventDangXem.startDate).toLocaleString("vi-VN")} -{" "}
                {new Date(eventDangXem.endDate).toLocaleString("vi-VN")}
              </div>
              <div>
                <b>Địa điểm:</b> {eventDangXem.location}
              </div>
              <div>
                <b>Trạng thái:</b>{" "}
                {eventDangXem.status === "upcoming"
                  ? "Sắp diễn ra"
                  : eventDangXem.status === "ongoing"
                  ? "Đang diễn ra"
                  : eventDangXem.status === "completed"
                  ? "Đã kết thúc"
                  : "Đã hủy"}
              </div>
              {eventDangXem.sponsors && eventDangXem.sponsors.length > 0 && (
                <div>
                  <b>Nhà tài trợ:</b>
                  {eventDangXem.sponsors.map((s, idx) => (
                    <img
                      key={idx}
                      src={s.logo}
                      alt="sponsor"
                      className="w-6 h-6 inline-block mx-1 rounded-full border"
                    />
                  ))}
                </div>
              )}
              {eventDangXem.qrCode && (
                <div>
                  <b>Mã QR:</b>
                  <div className="flex items-center gap-4 mt-2">
                    <img
                      src={eventDangXem.qrCode}
                      alt="QR code"
                      className="w-64 h-64 object-contain border rounded-lg"
                    />
                    <a
                      href={eventDangXem.qrCode}
                      download={`qr-event-${eventDangXem._id}.png`}
                      className="px-3 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg text-sm font-medium transition-colors border border-sky-200"
                    >
                      Tải mã QR
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal QR code */}
      {showQR?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center relative min-w-[320px]">
            <button
              onClick={() => setShowQR(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Đóng"
            >
              ×
            </button>
            <img
              src={showQR.qr}
              alt="QR Check-in"
              className="w-60 h-60 rounded-xl border shadow mb-2"
            />
            <span className="text-base text-gray-700 font-medium">
              Mã QR check-in
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
