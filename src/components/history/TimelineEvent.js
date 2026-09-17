import Link from "next/link";

export default function TimelineEvent({ event, isLast }) {
  
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'SYSTEM_VERSION':
        return 'bg-blue-100 text-blue-800';
      case 'REVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'INSIGHT':
        return 'bg-amber-100 text-amber-800';
      case 'VALIDATION':
        return 'bg-green-100 text-green-800';
      case 'EXPERIMENT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const badgeStyle = getBadgeStyle(event.type);

  return (
    <div className="relative pl-8 pb-8 group">
      {/* Vertical line connecting events */}
      {!isLast && (
        <div className="absolute left-[5px] top-6 bottom-0 w-[2px] bg-gray-100" />
      )}
      
      {/* Node dot */}
      <div className="absolute left-0 top-6 w-3 h-3 rounded-full bg-gray-300 border-[3px] border-white shadow-sm ring-1 ring-gray-100" />

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
            {event.type.replace('_', ' ')}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {event.version && (
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
              v{event.version}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {event.title}
        </h3>
        
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {event.description}
        </p>

        {event.type === 'SYSTEM_VERSION' && event.snapshot && (
          <div className="mb-4 space-y-4">
            {(event.snapshot.milestone_achieved || event.snapshot.result_triggered) && (
              <div className="bg-orange-50 rounded-lg p-4">
                {event.snapshot.milestone_achieved && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-orange-800 mb-1">Milestone Achieved</div>
                    <div className="font-semibold text-orange-950 text-base">{event.snapshot.milestone_achieved}</div>
                  </div>
                )}
                {event.snapshot.result_triggered && (
                  <div>
                    <div className="text-xs font-medium text-orange-800/70 mb-1 mt-3">Triggered By Result</div>
                    <div className="text-sm text-orange-900 bg-orange-100/50 px-2 py-1 rounded inline-block">{event.snapshot.result_triggered}</div>
                  </div>
                )}
              </div>
            )}
            
            {event.snapshot.inputs && Object.keys(event.snapshot.inputs).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-3">Active Inputs (Snapshot)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(event.snapshot.inputs).map(([key, val]) => (
                    <div key={key} className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1 truncate" title={key}>{key}</div>
                      <div className="text-sm font-medium text-gray-900 truncate" title={String(val)}>
                        {String(val)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {event.meta && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {Object.entries(event.meta).map(([key, value]) => (
              <div key={key} className="flex items-center text-sm">
                <span className="text-gray-500 mr-1.5">{key}:</span>
                <span className="font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded">{value}</span>
              </div>
            ))}
          </div>
        )}

        {event.link && (
          <Link 
            href={event.link}
            className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            View Record <span className="ml-1">→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
