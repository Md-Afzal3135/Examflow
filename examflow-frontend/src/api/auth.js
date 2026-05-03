import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://examflow-h6hv.onrender.com/api";

const api = axios.create({ baseURL: BASE_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (data) => api.put("/auth/profile", data);

// Exams
export const getExams = () => api.get("/exams");
export const getExamById = (id) => api.get(`/exams/${id}`);
export const submitExam = (id, answers) =>
  api.post(`/exams/${id}/submit`, { answers });

// Results
export const getResult = (examId) => api.get(`/results/${examId}`);
export const getStudentResults = () => api.get("/results/me");

// Admin
export const getQuestions = (examId) =>
  api.get("/questions", { params: examId ? { exam_id: examId } : {} });
export const createQuestion = (data) => api.post("/questions", data);
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/questions/${id}`);
export const scheduleExam = (data) => api.post("/exams", data);
export const getAllStudents = () => api.get("/admin/students");
export const getAdminStats = () => api.get("/admin/stats");
export const deleteExam = (id) => api.delete(`/admin/exams/${id}`);
export const toggleExam = (id) => api.patch(`/admin/exams/${id}/toggle`);

export default api;
