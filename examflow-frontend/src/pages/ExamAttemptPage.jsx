import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExamById, submitExam } from "../api/auth";
import Timer from "../components/Timer";
import QuestionNav from "../components/QuestionNav";

function normalizeQuestion(question) {
  return {
    ...question,
    options: question.options || [
      question.option_a,
      question.option_b,
      question.option_c,
      question.option_d,
    ].filter(Boolean),
  };
}

export default function ExamAttemptPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await getExamById(examId);
        setExam({
          ...res.data,
          questions: (res.data.questions || []).map(normalizeQuestion),
        });
      } catch (err) {
        console.error("Error fetching exam:", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, navigate]);

  const handleOptionSelect = (qId, optionIdx) => {
    setAnswers({ ...answers, [qId]: String.fromCharCode(65 + optionIdx) });
  };

  const handleSubmit = async ({ skipConfirm = false } = {}) => {
    if (submitting) return;
    if (!skipConfirm && !window.confirm("Are you sure you want to submit your exam?")) return;
    setSubmitting(true);
    try {
      await submitExam(examId, answers);
      navigate(`/results/${examId}`);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!exam?.questions?.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">No questions available</h2>
          <p className="text-slate-500 mb-6">This exam is not ready to attempt yet.</p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIdx];
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-primary text-white w-10 h-10 rounded-xl flex shrink-0 items-center justify-center font-bold">
            EF
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-slate-900 leading-tight break-words">{exam.title}</h1>
            <p className="text-xs text-slate-500 mt-1">Section: General Knowledge</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <Timer durationMinutes={exam.duration_minutes} onExpire={() => handleSubmit({ skipConfirm: true })} />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full sm:w-auto"
          >
            {submitting ? "Submitting..." : "Finish Exam"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="card shadow-lg mb-8">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Question {currentIdx + 1} of {exam.questions.length}
                </span>
                <span className="badge-primary">MCQ</span>
              </div>
              
              <h2 className="text-lg sm:text-xl font-medium text-slate-800 mb-8 leading-relaxed break-words">
                {currentQuestion.text}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(currentQuestion.id, idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start sm:items-center gap-4
                      ${currentAnswer === String.fromCharCode(65 + idx)
                        ? "border-primary bg-blue-50/50 ring-4 ring-blue-50" 
                        : "border-slate-100 hover:border-slate-200 bg-white"}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                      ${currentAnswer === String.fromCharCode(65 + idx)
                        ? "border-primary bg-primary text-white" 
                        : "border-slate-300 text-slate-400"}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`font-medium break-words ${currentAnswer === String.fromCharCode(65 + idx) ? "text-primary" : "text-slate-700"}`}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="btn-secondary disabled:opacity-30"
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentIdx(Math.min(exam.questions.length - 1, currentIdx + 1))}
                disabled={currentIdx === exam.questions.length - 1}
                className="btn-primary"
              >
                Next Question →
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar Nav */}
        <QuestionNav
          total={exam.questions.length}
          current={currentIdx}
          answered={Object.keys(answers).length}
          onSelect={setCurrentIdx}
          answers={answers}
          questions={exam.questions}
        />
      </div>
    </div>
  );
}
