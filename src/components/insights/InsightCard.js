import Link from "next/link";

export default function InsightCard({ insight }) {
  const getBadgeColor = (type) => {
    switch (type) {
      case 'VALIDATED': return 'text-moss';
      case 'HYPOTHESIS': return 'text-ochre';
      default: return 'text-ink/70';
    }
  };

  return (
    <div className="border border-divider bg-paper p-6 hover:bg-white transition-colors">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${getBadgeColor(insight.type)}`}>
          {insight.type}
        </span>
        <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">
          {insight.confidence} CONFIDENCE
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-ink mb-2 leading-tight">
        {insight.title}
      </h3>
      
      <p className="text-sm text-ink/70 mb-6 leading-relaxed">
        {insight.description}
      </p>
      
      <div className="border-t border-divider/50 pt-4 flex justify-between items-center">
        <div className="text-[10px] font-mono text-ink/50 uppercase">
          {insight.evidence?.observations || 0} Obs • {insight.evidence?.duration || '0 days'}
        </div>
        <Link 
          href={`/insights/${insight.id}`}
          className="text-[10px] font-bold uppercase tracking-widest text-ink hover:text-ochre transition-colors"
        >
          View Evidence →
        </Link>
      </div>
    </div>
  );
}
