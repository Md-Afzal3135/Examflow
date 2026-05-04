import { useState, useEffect } from "react";
import { getAdminStats, getAllStudents, getExams, deleteExam, toggleExam, deleteStudent } from "../api/auth";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_students: 0,
    total_exams: 0,
    total_attempts: 0,
    average_score: 0,
  });
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes, examsRes] = await Promise.all([
        getAdminStats(),
        getAllStudents(),
        getExams()
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data);
      setExams(examsRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${title}'?`)) return;
    try {
      await deleteExam(id);
      fetchData(); // Refresh UI
    } catch {
      alert("Failed to delete exam.");
    }
  };

  const handleToggleExam = async (id) => {
    try {
      await toggleExam(id);
      fetchData(); // Refresh UI
    } catch {
      alert("Failed to toggle exam status.");
    }
  };

  const handleDeleteStudent = async (id, name) => {
    const confirmName = window.prompt(`To permanently delete this student, type their name: ${name}`);
    if (confirmName !== name) {
      if (confirmName !== null) alert("Name did not match. Deletion cancelled.");
      return;
    }
    
    try {
      await deleteStudent(id);
      fetchData(); // Refresh UI
    } catch {
      alert("Failed to delete student.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">System overview and performance metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">👥</div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_students}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">📝</div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Exams</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_exams}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">📈</div>
            <div>
              <p className="text-sm font-medium text-slate-500">Average Score</p>
              <p className="text-2xl font-bold text-slate-900">{stats.average_score ?? stats.avg_score}%</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-2xl">✓</div>
            <div>
              <p className="text-sm font-medium text-slate-500">Attempts</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_attempts}</p>
            </div>
          </div>
        </div>

        {/* System Data / Exams Table */}
        <div className="card shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Manage System Data (Exams)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="table-header">Title</th>
                  <th className="table-header">Total Qs</th>
                  <th className="table-header">Marks</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-medium text-slate-900">{exam.title}</td>
                    <td className="table-cell">{exam.total_questions || 0}</td>
                    <td className="table-cell">{exam.total_marks}</td>
                    <td className="table-cell">
                      <span className={exam.is_active ? 'badge-success' : 'badge-danger'}>
                        {exam.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell text-right space-x-2">
                      <button onClick={() => handleToggleExam(exam.id)} className="text-xs font-semibold text-secondary hover:underline">
                        Toggle
                      </button>
                      <button onClick={() => handleDeleteExam(exam.id, exam.title)} className="text-xs font-semibold text-danger hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr>
                    <td colSpan="5" className="table-cell text-center py-8 text-slate-400">No exams configured yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students Table */}
        <div className="card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Recent Student Registrations</h2>
            <button className="text-sm text-primary font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Joined Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-medium text-slate-900">{student.name}</td>
                    <td className="table-cell">{student.email}</td>
                    <td className="table-cell">
                      {student.date_joined ? new Date(student.date_joined).toLocaleDateString() : "-"}
                    </td>
                    <td className="table-cell">
                      <span className="badge-success">Active</span>
                    </td>
                    <td className="table-cell text-right space-x-3">
                      <button onClick={() => navigate(`/admin/student/${student.id}`)} className="text-xs font-semibold text-primary hover:underline">
                        View Profile
                      </button>
                      <button onClick={() => handleDeleteStudent(student.id, student.name)} className="text-xs font-semibold text-danger hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="5" className="table-cell text-center py-8 text-slate-400">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
