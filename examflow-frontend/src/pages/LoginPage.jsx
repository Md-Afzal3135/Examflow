import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, requestPasswordReset } from "../api/auth";
import { sendPasswordResetEmail } from "../api/emailService";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Forgot-password modal state ──────────────────────────
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("idle"); // idle | sending | sent | error
  const [resetError, setResetError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginUser({ ...form, role });
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      if (!err.response) {
        setError("Network Error: Could not connect to the backend server.");
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || "Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Password-reset handler ───────────────────────────────
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetStatus("sending");
    setResetError("");

    try {
      // Ask backend to generate a signed token for this email
      const res = await requestPasswordReset(resetEmail.trim());
      const { token, name, otp } = res.data;

      if (!token) {
        // Email not found — backend still returns 200, show generic message
        setResetStatus("sent");
        return;
      }

      // Build the reset link — opens in a new tab from the email
      const resetLink = `${window.location.origin}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(resetEmail.trim())}`;

      await sendPasswordResetEmail({
        name: name || resetEmail.split("@")[0],
        email: resetEmail.trim(),
        resetLink,
        otp,
      });

      setResetStatus("sent");
    } catch (err) {
      console.error("[PasswordReset] error:", err);
      const detail = err?.response?.data?.error || err?.text || err?.message || "Unknown error";
      setResetStatus("error");
      setResetError(`Failed to send reset email: ${detail}`);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setResetEmail("");
    setResetStatus("idle");
    setResetError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-4 overflow-hidden ring-4 ring-white bg-white">
            <img src="/logo.png" alt="ExamFlow Logo" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            Exam<span className="text-primary">Flow</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Online Examination System</p>
        </div>

        {/* Card */}
        <div className="card shadow-xl border-0">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Sign in to your account</h2>

          {/* Role Selector */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            {["student", "admin"].map((r) => (
              <button
                key={r}
                id={`role-${r}`}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                  role === r
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r === "student" ? "🎓" : "⚙️"} {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
              />
              <div className="text-right mt-1.5">
                <button
                  id="forgot-password-btn"
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-primary hover:underline font-medium bg-transparent border-none cursor-pointer p-0"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger animate-fade-in">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          CountryEdu Private Limited · ExamFlow © 2026
        </p>
      </div>

      {/* ── Forgot-password modal ──────────────────────────── */}
      {showForgot && (
        <div
          id="forgot-password-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && closeForgot()}
        >
          <div className="card w-full max-w-sm shadow-2xl border-0 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
              <button
                id="close-forgot-modal-btn"
                type="button"
                onClick={closeForgot}
                className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {resetStatus === "sent" ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">📬</div>
                <p className="font-semibold text-slate-800">Check your inbox!</p>
                <p className="text-sm text-slate-500 mt-1">
                  A password-reset link has been sent to <span className="font-medium">{resetEmail}</span>.
                </p>
                <button
                  type="button"
                  onClick={closeForgot}
                  className="btn-primary w-full mt-6"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-sm text-slate-500">
                  Enter your registered email and we&apos;ll send you a reset link.
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reset-email">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                  />
                </div>

                {resetStatus === "error" && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger">
                    ⚠️ {resetError}
                  </div>
                )}

                <button
                  id="send-reset-email-btn"
                  type="submit"
                  disabled={resetStatus === "sending"}
                  className="btn-primary w-full"
                >
                  {resetStatus === "sending" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Sending…
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
