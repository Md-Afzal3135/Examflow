export default function ExamCard({ examTitle, duration, totalQuestions, onStart, subject, scheduledDate }) {
  return (
    <div className="card-hover flex flex-col gap-4 animate-slide-up group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl shadow-sm">
          📝
        </div>
        <span className="badge-primary">{totalQuestions} Qs</span>
      </div>

      {/* Content */}
      <div>
        <h3 className="font-bold text-slate-800 text-base leading-tight mb-1 group-hover:text-primary transition-colors">
          {examTitle}
        </h3>
        {subject && (
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{subject}</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {duration} min
        </span>
        {scheduledDate && (
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(scheduledDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Action */}
      <button
        id={`start-exam-${examTitle?.replace(/\s+/g, "-").toLowerCase()}`}
        onClick={onStart}
        className="btn-primary w-full mt-auto"
      >
        Start Exam →
      </button>
    </div>
  );
}
