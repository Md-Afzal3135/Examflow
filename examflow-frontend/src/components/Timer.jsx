import { useState, useEffect } from "react";

export default function Timer({ durationMinutes, onExpire }) {
  const [seconds, setSeconds] = useState(durationMinutes * 60);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire();
      return;
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds, onExpire]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const isUrgent = seconds < 300;
  const pct = Math.min(100, (seconds / (durationMinutes * 60)) * 100);

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
      isUrgent
        ? "border-red-300 bg-red-50 animate-pulse"
        : "border-blue-200 bg-blue-50"
    }`}>
      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isUrgent ? "text-danger" : "text-primary"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <div className={`font-mono text-2xl font-bold leading-none ${isUrgent ? "text-danger" : "text-primary"}`}>
          {mm}:{ss}
        </div>
        <div className="w-24 h-1 mt-1 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? "bg-danger" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
