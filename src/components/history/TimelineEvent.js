import Link from "next/link";

export default function TimelineEvent({ event, isLast }) {
  
  const getEventStyle = (type) => {
    switch (type) {
      case 'SYSTEM_VERSION':
        return { color: 'text-ink', border: 'border-ink', label: 'bg-ink text-paper' };
      case 'REVIEW':
        return { color: 'text-ochre', border: 'border-ochre/30', label: 'bg-white border-ochre/30 text-ochre' };
      case 'INSIGHT':
        return { color: 'text-ink/70', border: 'border-divider', label: 'bg-white border-divider text-ink/70' };
      case 'VALIDATION':
        return { color: 'text-moss', border: 'border-moss/30', label: 'bg-white border-moss/30 text-moss' };
      case 'EXPERIMENT':
        return { color: 'text-ink/50', border: 'border-divider', label: 'bg-white border-divider text-ink/50' };
      default:
        return { color: 'text-ink/50', border: 'border-divider', label: 'bg-white border-divider text-ink/50' };
    }
  };

  const style = getEventStyle(event.type);

  return (
    <div className="relative pl-8 pb-12 group">
      {/* Vertical line connecting events */}
      {!isLast && (
        <div className="absolute left-0 top-6 bottom-0 w-px bg-divider group-hover:bg-ink/20 transition-colors" />
      )}
      
      {/* Node dot */}
      <div className={`absolute left-[-4px] top-1.5 w-2 h-2 ${style.label.includes('bg-ink') ? 'bg-ink' : 'bg-white border-2 border-divider'}`} />

      {/* Content */}
      <div className={`border-l-2 pl-6 ${style.border}`}>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${style.label}`}>
            {event.type.replace('_', ' ')}
          </span>
          <span className="text-xs font-mono text-ink/50">
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {event.version && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
              v{event.version}
            </span>
          )}
        </div>
        
        <h3 className={`text-lg font-bold mb-2 ${style.color}`}>
          {event.title}
        </h3>
        
        <p className="text-sm text-ink/80 leading-relaxed mb-4 max-w-2xl">
          {event.description}
        </p>

        {event.meta && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-xs">
            {Object.entries(event.meta).map(([key, value]) => (
              <div key={key}>
                <span className="text-ink/40 uppercase tracking-widest text-[9px] mr-2">{key}:</span>
                <span className="font-mono text-ink/80">{value}</span>
              </div>
            ))}
          </div>
        )}

        {event.link && (
          <Link 
            href={event.link}
            className="text-[10px] font-bold uppercase tracking-widest text-ink/50 hover:text-ink transition-colors"
          >
            View Record →
          </Link>
        )}
      </div>
    </div>
  );
}
