import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../api/auth";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please request a new one.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setMessage(res.data.message || "Email verified successfully!");
        setStatus("success");
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || "Verification failed. The link may have expired.";
        setMessage(msg);
        setStatus("error");
      });
  }, [token]);

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
          <p className="text-slate-500 mt-1 text-sm">Email Verification</p>
        </div>

        <div className="card shadow-xl border-0 text-center py-10">

          {/* Verifying */}
          {status === "verifying" && (
            <>
              <div className="flex justify-center mb-5">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Verifying your email…</h2>
              <p className="text-slate-500 text-sm">Please wait a moment.</p>
            </>
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

          {/* Error */}
          {status === "error" && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
              <p className="text-slate-500 mb-2">{message}</p>
              <p className="text-xs text-slate-400 mb-6">
                Verification links expire after 24 hours.
              </p>
              <Link
                id="verify-error-login-btn"
                to="/login"
                className="btn-primary inline-block"
              >
                Back to Login
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
