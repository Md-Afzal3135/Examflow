import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { confirmPasswordReset } from "../api/auth";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [form, setForm]     = useState({ password: "", confirm: "", otp: "" });
  const [status, setStatus] = useState("idle");   // idle | submitting | success | error
  const [error, setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
      return;
    }
    if (!form.otp) {
      setError("OTP is required.");
      return;
    }

    setStatus("submitting");
    try {
      await confirmPasswordReset(token, form.password, form.otp);
      setStatus("success");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to reset password. The link may have expired.";
      setError(msg);
      setStatus("error");
    }
  };

  // ── Success State ───────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="card shadow-xl border-0 text-center py-10">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Password Reset!</h1>
            <p className="text-slate-500 mb-6">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Go to Login →
            </Link>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">
            CountryEdu Private Limited · ExamFlow © 2026
          </p>
        </div>
      </div>
    );
  }

  // ── No Token State ──────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
        <div className="card shadow-xl border-0 text-center py-10 max-w-md w-full">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid Reset Link</h2>
          <p className="text-slate-500 mb-6">This link is missing required information. Please request a new password reset.</p>
          <Link to="/login" className="btn-primary inline-block">Back to Login</Link>
        </div>
      </div>
    );
  }

  // ── Form State ──────────────────────────────────────────────
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
          <p className="text-slate-500 mt-1 text-sm">Set your new password</p>
        </div>

        <div className="card shadow-xl border-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-xl">🔐</div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Reset Password</h2>
              {email && <p className="text-xs text-slate-400 mt-0.5">For {email}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="otp">
                6-Digit OTP
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                className="input-field"
                placeholder="Enter 6-digit OTP from email"
                autoFocus
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="new-password">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder="Minimum 6 characters"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="input-field"
                placeholder="Repeat your new password"
              />
            </div>

            {/* Password match indicator */}
            {form.password && form.confirm && (
              <div className={`flex items-center gap-2 text-xs font-medium ${form.password === form.confirm ? "text-emerald-600" : "text-red-500"}`}>
                <span>{form.password === form.confirm ? "✅" : "❌"}</span>
                {form.password === form.confirm ? "Passwords match" : "Passwords do not match"}
              </div>
            )}

            {/* Error */}
            {(error || status === "error") && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger animate-fade-in">
                <span>⚠️</span> {error || "Something went wrong. Please try again."}
              </div>
            )}

            {/* Submit */}
            <button
              id="reset-password-submit-btn"
              type="submit"
              disabled={status === "submitting"}
              className="btn-primary w-full"
            >
              {status === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Resetting…
                </span>
              ) : (
                "Set New Password"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Remembered your password?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          CountryEdu Private Limited · ExamFlow © 2026
        </p>
      </div>
    </div>
  );
}
