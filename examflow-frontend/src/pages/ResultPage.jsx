import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getResult } from "../api/auth";
import Navbar from "../components/Navbar";

export default function ResultPage() {
  const { examId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await getResult(examId);
        setResult(res.data);
      } catch (err) {
        console.error("Error fetching result:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">No result found</h2>
        <Link to="/dashboard" className="btn-primary">Return to Dashboard</Link>
      </div>
    );
  }

  const passed = result.score >= 40;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="card shadow-xl overflow-hidden p-0 mb-8 animate-slide-up">
          <div className={`p-10 text-center text-white ${passed ? 'bg-emerald-600' : 'bg-red-600'}`}>
            <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 text-4xl">
              {passed ? "🎉" : "💪"}
            </div>
            <h1 className="text-4xl font-bold mb-2">{passed ? "Congratulations!" : "Keep Trying!"}</h1>
            <p className="text-white/80 text-lg">You have completed <b>{result.exam_title}</b></p>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-white border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-500 uppercase font-semibold mb-1">Your Score</p>
              <p className={`text-4xl font-bold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>{result.score}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase font-semibold mb-1">Questions</p>
              <p className="text-4xl font-bold text-slate-800">{result.total_questions}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase font-semibold mb-1">Result</p>
              <p className="text-4xl font-bold text-slate-800">{passed ? "PASS" : "FAIL"}</p>
            </div>
          </div>

          <div className="p-8 flex justify-center gap-4 bg-slate-50/50">
            <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
            <button onClick={() => window.print()} className="btn-primary">Download Report</button>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="space-y-6">
          <h2 className="section-title">Question Breakdown</h2>
          {result.breakdown?.map((item, idx) => (
            <div key={idx} className="card border-l-4 p-5" style={{ borderLeftColor: item.is_correct ? '#10B981' : '#EF4444' }}>
              <div className="flex justify-between items-start mb-3">
                <p className="font-semibold text-slate-800 leading-snug">Q{idx + 1}. {item.question_text}</p>
                <span className={item.is_correct ? 'badge-success' : 'badge-danger'}>
                  {item.is_correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-500 mb-1">Your Answer:</p>
                  <p className={`font-medium ${item.is_correct ? 'text-emerald-700' : 'text-red-700'}`}>{item.student_answer || "Not Answered"}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-emerald-600 mb-1">Correct Answer:</p>
                  <p className="font-medium text-emerald-800">{item.correct_answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
