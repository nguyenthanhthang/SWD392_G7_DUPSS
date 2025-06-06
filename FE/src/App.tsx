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
import Service from "./pages/admin/Service";
import Consultant from "./pages/admin/Consultant";
import AboutUsPage from "./pages/AboutUsPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Profile from "./pages/Profile";
import ServicePage from "./pages/ServicePage";
import AppointmentsPage from "./pages/Appointments";
import PaymentHistory from "./pages/PaymentHistory";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes dành cho Admin */}
          <Route path="/admin"element={ <ProtectedRoute requiredRoles={['admin']}> <MainLayout> <AdminDashboard /> </MainLayout> </ProtectedRoute>}/>
          <Route path="/admin/users" element={<ProtectedRoute requiredRoles={['admin']}><MainLayout><AccountList /></MainLayout></ProtectedRoute>}/>
          <Route path="/admin/blogs"element={<ProtectedRoute requiredRoles={['admin']}><MainLayout><div className="p-6 bg-white rounded-lg shadow-sm">Quản lý blog</div></MainLayout></ProtectedRoute>}/>
          <Route path="/admin/consultants" element={<ProtectedRoute requiredRoles={['admin']}><MainLayout><Consultant /></MainLayout></ProtectedRoute>}/>
          <Route path="/admin/reports" element={<ProtectedRoute requiredRoles={['admin']}><MainLayout><div className="p-6 bg-white rounded-lg shadow-sm">Báo cáo thống kê</div></MainLayout></ProtectedRoute>}/>
          <Route path="/admin/services"element={<ProtectedRoute requiredRoles={['admin']}><MainLayout><Service /></MainLayout></ProtectedRoute>}/>
          
          {/* Routes cho User */}
          <Route path="/" element={<Home />} />
          <Route path="/quizz" element={<QuizzPage />} />
          <Route path="/consulting" element={<ConsultingPage />} />
          <Route path="/consultant/:id" element={<ConsultantDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/service" element={<ServicePage />} /> 
          <Route path="/profile" element={<Profile />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          
          {/* Routes cho Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
