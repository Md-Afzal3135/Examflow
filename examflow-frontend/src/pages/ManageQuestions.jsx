import { useState, useEffect } from "react";
import { getExams, getQuestions, createQuestion, updateQuestion, deleteQuestion } from "../api/auth";
import Navbar from "../components/Navbar";

export default function ManageQuestions() {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [form, setForm] = useState({ text: "", options: ["", "", "", ""], correct_idx: 0 });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await getExams();
        setExams(res.data);
        if (res.data.length > 0) setSelectedExam(res.data[0].id);
      } catch (err) {
        console.error("Error fetching exams:", err);
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExam) return;
    fetchQuestions(selectedExam);
  }, [selectedExam]);

  const fetchQuestions = async (examId) => {
    try {
      const res = await getQuestions(examId);
      setQuestions(res.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const resetForm = () => {
    setForm({ text: "", options: ["", "", "", ""], correct_idx: 0 });
    setEditingId(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, exam_id: selectedExam };
      if (editingId) {
        await updateQuestion(editingId, payload);
      } else {
        await createQuestion(payload);
      }
      await fetchQuestions(selectedExam);
      resetForm();
    } catch {
      alert(editingId ? "Failed to update question." : "Failed to add question.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setEditingId(question.id);
    setForm({
      text: question.text,
      options: [
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d,
      ],
      correct_idx: Math.max(0, (question.correct_option || "A").charCodeAt(0) - 65),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question permanently?")) return;
    try {
      await deleteQuestion(id);
      await fetchQuestions(selectedExam);
      if (editingId === id) resetForm();
    } catch {
      alert("Failed to delete question.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Manage Questions</h1>
          <p className="text-slate-500 mt-1">Add or edit questions for existing exams</p>
        </div>

        <div className="card shadow-lg mb-8">
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Exam</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="input-field"
                required
              >
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>{exam.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Question Text</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="What is the capital of France?"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.options.map((opt, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5 flex justify-between">
                    Option {String.fromCharCode(65 + idx)}
                    <input
                      type="radio"
                      name="correct"
                      checked={form.correct_idx === idx}
                      onChange={() => setForm({ ...form, correct_idx: idx })}
                    />
                  </label>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...form.options];
                      newOpts[idx] = e.target.value;
                      setForm({ ...form, options: newOpts });
                    }}
                    className="input-field"
                    placeholder={`Answer option ${idx + 1}`}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel Edit
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Saving..." : editingId ? "Update Question" : "Add Question"}
              </button>
            </div>
          </form>
        </div>

        <div className="card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Question Bank</h2>
            <p className="text-sm text-slate-500 mt-1">Edit or remove questions for the selected exam.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="table-header">Question</th>
                  <th className="table-header">Correct</th>
                  <th className="table-header">Marks</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((question) => (
                  <tr key={question.id} className="hover:bg-slate-50/50">
                    <td className="table-cell max-w-xl">
                      <p className="font-medium text-slate-900">{question.text}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        A. {question.option_a} · B. {question.option_b} · C. {question.option_c} · D. {question.option_d}
                      </p>
                    </td>
                    <td className="table-cell">
                      <span className="badge-success">{question.correct_option}</span>
                    </td>
                    <td className="table-cell">{question.marks}</td>
                    <td className="table-cell text-right space-x-2">
                      <button onClick={() => handleEdit(question)} className="text-xs font-semibold text-secondary hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(question.id)} className="text-xs font-semibold text-danger hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="table-cell text-center py-8 text-slate-400">
                      No questions added for this exam yet.
                    </td>
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
