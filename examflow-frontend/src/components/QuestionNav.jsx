export default function QuestionNav({ total, current, answers = {}, questions = [], onSelect }) {
  const answeredCount = Object.keys(answers).length;

  return (
    <aside className="card m-4 lg:m-8 lg:ml-0 lg:w-72 lg:shrink-0">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Question Navigator</h3>
      <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 mb-4">
        {Array.from({ length: total }, (_, i) => {
          const idx = i + 1;
          const questionId = questions[i]?.id;
          const isAnswered = questionId ? Boolean(answers[questionId]) : false;
          const isCurrent = current === i;
          let cls = "w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-150 cursor-pointer border ";
          if (isCurrent) cls += "bg-primary text-white border-primary shadow-md";
          else if (isAnswered) cls += "bg-success text-white border-success";
          else cls += "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary";
          return (
            <button key={i} className={cls} onClick={() => onSelect(i)} id={`q-nav-${idx}`}>
              {idx}
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-col gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success" />
          <span>Answered ({answeredCount}/{total})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-slate-200" />
          <span>Not visited</span>
        </div>
      </div>
    </aside>
  );
}
