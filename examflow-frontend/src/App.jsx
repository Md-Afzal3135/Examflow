import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import StudentDashboard from "./pages/StudentDashboard";
import ExamAttemptPage from "./pages/ExamAttemptPage";
import ResultPage from "./pages/ResultPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudentProfile from "./pages/AdminStudentProfile";
import ManageQuestions from "./pages/ManageQuestions";
import ScheduleExam from "./pages/ScheduleExam";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Student Routes */}
          <Route element={<ProtectedRoute role="student" />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/exam/:examId" element={<ExamAttemptPage />} />
            <Route path="/results/:examId" element={<ResultPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/student/:id" element={<AdminStudentProfile />} />
            <Route path="/admin/questions" element={<ManageQuestions />} />
            <Route path="/admin/schedule" element={<ScheduleExam />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
