import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, sendVerification } from "../api/auth";
import { sendWelcomeEmail, sendVerificationEmail } from "../api/emailService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const regRes = await registerUser({ name: form.name, email: form.email, password: form.password, role: "student" });
      const token = localStorage.getItem("token") || regRes?.data?.token;

      // Send welcome + verification emails (fire-and-forget)
      sendWelcomeEmail({ name: form.name, email: form.email }).catch(() => {});

      // Get a signed verification token from backend and send verification email
      if (token) {
        // Temporarily store token to authenticate the send-verification call
        const origToken = localStorage.getItem("token");
        localStorage.setItem("token", token);
        sendVerification()
          .then((vRes) => {
            const { token: vToken, name, email } = vRes.data;
            const verifyLink = `${window.location.origin}/verify-email?token=${encodeURIComponent(vToken)}`;
            sendVerificationEmail({ name, email, verifyLink }).catch(() => {});
          })
          .catch(() => {})
          .finally(() => {
            // Restore original token (user not logged in yet)
            if (origToken) localStorage.setItem("token", origToken);
            else localStorage.removeItem("token");
          });
      }

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">EF</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            Exam<span className="text-primary">Flow</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Create your student account</p>
        </div>

        <div className="card shadow-xl border-0">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" required value={form.name} onChange={handleChange}
                className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-email">Email</label>
              <input id="reg-email" name="email" type="email" required value={form.email} onChange={handleChange}
                className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" required value={form.password} onChange={handleChange}
                className="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange}
                className="input-field" placeholder="••••••••" />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            <button id="register-submit-btn" type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Creating account…
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
