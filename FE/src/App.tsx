import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import QuizzPage from "./pages/QuizzPage";
import ConsultingPage from "./pages/ConsultingPage";
import EventsPage from "./pages/EventsPage";
import BlogPage from "./pages/BlogPage";
import SigninPage from "./pages/Singnin";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quizz" element={<QuizzPage />} />
          <Route path="/consulting" element={<ConsultingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/signin" element={<SigninPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
