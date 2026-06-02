import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../api/auth";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | verifying | success | error
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please request a new one.");
      return;
    }
    if (!otp) {
      setStatus("error");
      setMessage("Please enter the 6-digit OTP.");
      return;
    }

    setStatus("verifying");
    try {
      const res = await verifyEmail(token, otp);
      setMessage(res.data.message || "Email verified successfully!");
      setStatus("success");
    } catch (err) {
      const msg = err?.response?.data?.error || "Verification failed. The link or OTP may be invalid.";
      setMessage(msg);
      setStatus("error");
    }
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
          <p className="text-slate-500 mt-1 text-sm">Email Verification</p>
        </div>

        <div className="card shadow-xl border-0 text-center py-10">

          {/* Form */}
          {status !== "success" && (
            <form onSubmit={handleVerify} className="space-y-4 px-6 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="otp">
                  Enter 6-Digit OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field"
                  placeholder="Enter OTP sent to your email"
                  autoFocus
                />
              </div>

              {/* Error */}
              {status === "error" && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger animate-fade-in">
                  <span>⚠️</span> {message || "Something went wrong. Please try again."}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "verifying"}
                className="btn-primary w-full"
              >
                {status === "verifying" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Verifying…
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Email Verified!</h2>
              <p className="text-slate-500 mb-6">{message}</p>
              <Link
                id="verify-success-login-btn"
                to="/login"
                className="btn-primary inline-block"
              >
                Go to Login →
              </Link>
            </>
          )}

        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          CountryEdu Private Limited · ExamFlow © 2026
        </p>
      </div>
    </div>
  );
}
