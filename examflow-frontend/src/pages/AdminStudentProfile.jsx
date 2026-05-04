import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getStudentAnalytics, deleteStudent } from "../api/auth";
import Navbar from "../components/Navbar";

export default function AdminStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getStudentAnalytics(id);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching student analytics:", err);
        alert("Failed to load student data.");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id, navigate]);

  const handleDelete = async () => {
    const confirmName = window.prompt(`To permanently delete this student, type their name: ${data?.student?.name}`);
    if (confirmName !== data?.student?.name) {
      if (confirmName !== null) alert("Name did not match. Deletion cancelled.");
      return;
    }
    
    try {
      await deleteStudent(id);
      navigate("/admin");
    } catch (err) {
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

  if (!data) return null;

  const { student, analytics, history } = data;

  // Format chart data (limit to last 10 attempts for cleaner graph)
  const chartData = history.slice(-10).map((attempt, index) => ({
    name: `Exam ${index + 1}`,
    score: attempt.score,
    title: attempt.exam_title
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
              <p className="text-slate-500">{student.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  Joined: {new Date(student.date_joined).toLocaleDateString()}
                </span>
                <span className={student.email_verified ? 'badge-success' : 'badge-danger'}>
                  {student.email_verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/admin")} className="btn-secondary">
              Back to Dashboard
            </button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors">
              Delete Student
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">📝</div>
            <div>
              <p className="text-sm font-medium text-slate-500">Exams Taken</p>
              <p className="text-2xl font-bold text-slate-900">{analytics.total_exams_taken}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">📈</div>
            <div>
              <p className="text-sm font-medium text-slate-500">Average Score</p>
              <p className="text-2xl font-bold text-slate-900">{analytics.average_score}%</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">🎯</div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pass Rate</p>
              <p className="text-2xl font-bold text-slate-900">{analytics.pass_rate}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 card shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Performance Progression</h2>
              <p className="text-xs text-slate-500">Score percentage over recent exams</p>
            </div>
            <div className="flex-1 p-6">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#334155' }}
                      formatter={(value, name, props) => [`${value}%`, props.payload.title]}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  No exam data available for charting.
                </div>
              )}
            </div>
          </div>

          {/* History List */}
          <div className="card shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Recent Attempts</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
              <div className="divide-y divide-slate-100">
                {history.length > 0 ? (
                  [...history].reverse().map((attempt) => (
                    <div key={attempt.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-800">{attempt.exam_title}</p>
                        <p className="text-xs text-slate-500">{new Date(attempt.submitted_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-900">{attempt.score}%</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${attempt.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                          {attempt.passed ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Student hasn't taken any exams yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
