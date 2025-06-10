import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EventsPage from "./pages/EventsPage";
import AdminLayout from "./components/layout/AdminLayout";
import EventManagement from "./pages/admin/EventManagement";
import Home from "./pages/Home";
import QuizzPage from "./pages/QuizzPage";
import ConsultingPage from "./pages/ConsultingPage";
import BlogPage from "./pages/BlogPage";
import AccountList from "./pages/admin/AccountList";
import ConsultantDetailPage from "./pages/ConsultantDetailPage";
import Service from "./pages/admin/Service";
import Consultant from "./pages/admin/Consultant";
import AboutUsPage from "./pages/AboutUsPage";
import ServicePage from "./pages/ServicePage";
import AppointmentsPage from "./pages/Appointments";
import PaymentHistory from "./pages/PaymentHistory";

import AdminDashboard from "./pages/admin/Dashboard";
import { useEffect } from "react";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { replace: true });
      } else if (user.role !== "admin") {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user?.role === "admin" ? <>{children}</> : null;
}

function ConsultantRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { replace: true });
      } else if (user.role !== "consultant") {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user?.role === "consultant" ? <>{children}</> : null;
}

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
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/quizz" element={<QuizzPage />} />
        <Route path="/consulting" element={<ConsultingPage />} />
        <Route path="/consultant/:id" element={<ConsultantDetailPage />} />
        <Route path="/blogs" element={<BlogPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/service" element={<ServicePage />} />

        {/* Protected Routes */}
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <EventsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <AppointmentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment-history"
          element={
            <PrivateRoute>
              <PaymentHistory />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AccountList />} />
                  <Route path="services" element={<Service />} />
                  <Route path="events" element={<EventManagement />} />
                  <Route path="consultants" element={<Consultant />} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* Consultant Routes */}
        <Route
          path="/consultant-portal/*"
          element={
            <ConsultantRoute>
              <AdminLayout>
                <Routes>
                  <Route path="events" element={<EventManagement />} />
                  <Route path="consultants" element={<Consultant />} />
                </Routes>
              </AdminLayout>
            </ConsultantRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
