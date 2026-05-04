import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExams, getStudentResults } from "../api/auth";
import ExamCard from "../components/ExamCard";
import Navbar from "../components/Navbar";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, resultRes] = await Promise.all([
          getExams(),
          getStudentResults(),
        ]);
        setExams(examRes.data);
        setResults(resultRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
            <p className="text-slate-500 mt-1">Ready for your next examination?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Exams */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="section-title">Available Exams</h2>
            {exams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    examTitle={exam.title}
                    duration={exam.duration_minutes}
                    totalQuestions={exam.total_questions}
                    scheduledDate={exam.scheduled_at}
                    onStart={() => navigate(`/exam/${exam.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-slate-400">No exams scheduled at the moment.</p>
              </div>
            )}
          </div>

          {/* Sidebar - Recent Results */}
          <div className="space-y-6">
            <h2 className="section-title">Recent Results</h2>
            <div className="card divide-y divide-slate-100 p-0">
              {results.length > 0 ? (
                results.map((res) => (
                  <div key={res.id} className="p-4 flex justify-between items-center">
                    {(() => {
                      const percentage = res.percentage ?? res.score ?? 0;
                      return (
                        <>
                    <div>
                      <p className="font-semibold text-slate-800">{res.exam_title}</p>
                      <p className="text-xs text-slate-500">
                        {res.submitted_at ? new Date(res.submitted_at).toLocaleDateString() : "Submitted"}
                      </p>
                    </div>
                    <div className={`badge-${percentage >= 40 ? 'success' : 'danger'}`}>
                      {percentage}%
                    </div>
                        </>
                      );
                    })()}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-xs text-slate-400">No results yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
