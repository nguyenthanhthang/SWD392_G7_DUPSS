import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
import BlogDetailPage from "./pages/BlogDetailPage";
import AccountList from "./pages/admin/AccountList";
import ConsultantDetailPage from "./pages/ConsultantDetailPage";
import Service from "./pages/admin/Service";
import Consultant from "./pages/admin/Consultant";
import AboutUsPage from "./pages/AboutUsPage";
import ServicePage from "./pages/ServicePage";
import AppointmentsPage from "./pages/Appointments";
import PaymentHistory from "./pages/PaymentHistory";
import BlogManagement from "./pages/admin/BlogManagement";
import ConsultantLayout from "./components/layout/ConsultantLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import ConsultantDashboard from "./pages/consultant/ConsultantDashboard";
import ScheduleManagement from "./pages/consultant/ScheduleManagement";
import ReportsAndUpdates from "./pages/consultant/Reports&Updates";
import ConsultantProfile from "./pages/consultant/ConsultantProfile";
import ReportsDetails from "./pages/consultant/ReportsDetails";
import PaymentResultPage from "./pages/PaymentResultPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === "admin" ? <>{children}</> : <Navigate to="/" replace />;
}

function ConsultantRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === "consultant" ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace />
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
        <Route path="/blogs/:id" element={<BlogDetailPage />} />
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
        <Route
          path="/payment/result"
          element={
            <PrivateRoute>
              <PaymentResultPage />
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
                  <Route path="blogs" element={<BlogManagement />} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* Consultant Routes */}
        <Route
          path="/consultants/*"
          element={
            <ConsultantRoute>
              <ConsultantLayout>
                <Routes>
                  <Route index element={<ConsultantDashboard />} />
                  <Route path="dashboard" element={<ConsultantDashboard />} />
                  <Route path="events" element={<EventManagement />} />
                  <Route path="schedule" element={<ScheduleManagement />} />
                  <Route path="reports" element={<ReportsAndUpdates />} />
                  <Route path="reports/:patientId" element={<ReportsDetails />} />
                  <Route path="consultant-profile" element={<ConsultantProfile />} />
                </Routes>
              </ConsultantLayout>
            </ConsultantRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
