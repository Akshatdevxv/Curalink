export default function ResponseCard({ message }) {
  const data = message.content;

  return (
    <div className="flex flex-col gap-4">
      {data.condition_overview && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-blue-400 uppercase tracking-wider mb-2">
            📋 Condition Overview
          </p>
          <p className="text-sm text-gray-200 leading-relaxed">
            {data.condition_overview}
          </p>
        </div>
      )}

      {data.biochemical_analysis && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-purple-400 uppercase tracking-wider mb-2">
            🧬 Biochemical Analysis
          </p>
          <p className="text-sm text-gray-200 leading-relaxed">
            {data.biochemical_analysis}
          </p>
        </div>
      )}

      {data.key_insights && data.key_insights.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-blue-400 uppercase tracking-wider">
            🔬 Research Insights
          </p>
          {data.key_insights.map((insight, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-700 rounded-xl p-4"
            >
              <p className="text-sm text-gray-200 leading-relaxed">
                <span className="text-blue-400 font-medium">
                  [{insight.reference_number}]
                </span>{" "}
                {insight.insight}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">
                  {insight.source_title?.slice(0, 60)}...
                </span>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">
                  {insight.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.clinical_trials && data.clinical_trials.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-blue-400 uppercase tracking-wider">
            🏥 Clinical Trials
          </p>
          {data.clinical_trials.map((trial, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-700 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm text-gray-200 font-medium">
                  {trial.title}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full shrink-0 ${trial.status === "RECRUITING" ? "bg-green-900 text-green-400" : "bg-gray-800 text-gray-400"}`}
                >
                  {trial.status}
                </span>
              </div>
              {trial.phase && (
                <p className="text-xs text-purple-400 mb-1">
                  Phase: {trial.phase}
                </p>
              )}
              {trial.location && (
                <p className="text-xs text-gray-500 mb-1">
                  📍 {trial.location}
                </p>
              )}
              <p className="text-xs text-gray-400">{trial.relevance}</p>
            </div>
          ))}
        </div>
      )}

      {data.next_steps && data.next_steps.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-green-400 uppercase tracking-wider mb-3">
            🎯 Next Steps
          </p>
          <ul className="flex flex-col gap-2">
            {data.next_steps.map((step, i) => (
              <li key={i} className="text-sm text-gray-200 flex gap-2">
                <span className="text-green-400 shrink-0">•</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.personalized_note && (
        <div className="bg-blue-950 border border-blue-800 rounded-xl p-4">
          <p className="text-xs text-blue-400 uppercase tracking-wider mb-2">
            💊 Personalized Note
          </p>
          <p className="text-sm text-gray-200 leading-relaxed">
            {data.personalized_note}
          </p>
        </div>
      )}

      {data.references && data.references.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            📚 References
          </p>
          <div className="flex flex-col gap-2">
            {data.references.map((ref, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-blue-400 text-xs shrink-0">
                  [{ref.number}]
                </span>
                <div>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-300 hover:text-blue-200 underline"
                  >
                    {ref.title}
                  </a>
                  <p className="text-xs text-gray-500">
                    {ref.authors} · {ref.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.follow_up_suggestions && data.follow_up_suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Suggested Follow-ups
          </p>
          <div className="flex flex-wrap gap-2">
            {data.follow_up_suggestions.map((s, i) => (
              <span
                key={i}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {message.meta && (
        <p className="text-xs text-gray-600">
          Analyzed {message.meta.totalFetched} papers ·{" "}
          {message.meta.trialsCount} trials found
        </p>
      )}
    </div>
  );
}
