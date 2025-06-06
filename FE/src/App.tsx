import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import QuizzPage from "./pages/QuizzPage";
import ConsultingPage from "./pages/ConsultingPage";
import EventsPage from "./pages/EventsPage";
import BlogPage from "./pages/BlogPage";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import AccountList from "./pages/admin/AccountList";
import ConsultantDetailPage from "./pages/ConsultantDetailPage";
import Profile from "./pages/Profile";
import ServicePage from "./pages/ServicePage";
import AppointmentsPage from "./pages/Appointments";
import PaymentHistory from "./pages/PaymentHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes dành cho Admin */}
        <Route path="/admin" element={<MainLayout><AdminDashboard /></MainLayout>} />
        <Route path="/admin/users" element={<MainLayout><AccountList /></MainLayout>} />
        <Route path="/admin/courses" element={<MainLayout><div className="p-6 bg-white rounded-lg shadow-sm">Quản lý khóa học</div></MainLayout>} />
        <Route path="/admin/blogs" element={<MainLayout><div className="p-6 bg-white rounded-lg shadow-sm">Quản lý blog</div></MainLayout>} />
        <Route path="/admin/consulting" element={<MainLayout><div className="p-6 bg-white rounded-lg shadow-sm">Quản lý tư vấn</div></MainLayout>} />
        <Route path="/admin/reports" element={<MainLayout><div className="p-6 bg-white rounded-lg shadow-sm">Báo cáo thống kê</div></MainLayout>} />
        <Route path="/admin/settings" element={<MainLayout><div className="p-6 bg-white rounded-lg shadow-sm">Cài đặt hệ thống</div></MainLayout>} />
        
        {/* Routes cho User */}
        <Route path="/" element={<Home />} />
        <Route path="/quizz" element={<QuizzPage />} />
        <Route path="/consulting" element={<ConsultingPage />} />
        <Route path="/consultant/:id" element={<ConsultantDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/blogs" element={<BlogPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/services" element={<ServicePage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        
        {/* Routes cho Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
