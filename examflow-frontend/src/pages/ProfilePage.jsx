import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/auth";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const { user, login } = useAuth(); // We'll need login to refresh user data context if needed, but not strictly
  const [form, setForm] = useState({ name: "", password: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name || "" }));
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      // Direct axios call to profile
      const res = await api.put("/auth/profile", form);
      setMsg({ text: "Profile updated successfully.", type: "success" });
      // Update context token and user
      const currentToken = localStorage.getItem("token");
      if (res.data && res.data.user) {
        login(res.data.user, currentToken);
      }
    } catch {
      setMsg({ text: "Update failed. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow animate-slide-up">
        <h2 className="text-xl font-bold text-slate-800 mb-6">My Profile</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input 
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input 
              type="password" 
              className="input-field"
              placeholder="Leave blank to keep current"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
        {msg.text && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            <span>{msg.type === 'success' ? '✅' : '⚠️'}</span> {msg.text}
          </div>
        )}
      </main>
    </div>
  );
}
