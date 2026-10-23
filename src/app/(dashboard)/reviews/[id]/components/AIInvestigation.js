"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  ChevronDown,
  ChevronUp,
  Target,
  Shield,
  AlertTriangle,
  Eye,
  Zap,
} from "lucide-react";

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    "On track": { bg: "bg-green-100 text-green-700", icon: <TrendingUp className="w-3 h-3" /> },
    "At risk": { bg: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="w-3 h-3" /> },
    "Off track": { bg: "bg-red-100 text-red-700", icon: <TrendingDown className="w-3 h-3" /> },
    Unknown: { bg: "bg-gray-100 text-gray-600", icon: <Minus className="w-3 h-3" /> },
  };
  const { bg, icon } = map[status] || map["Unknown"];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${bg}`}>
      {icon} {status}
    </span>
  );
}

function ConfidenceBadge({ level }) {
  const map = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[level] || "bg-gray-100 text-gray-600"}`}>
      {level} confidence
    </span>
  );
}

function DataBadge({ availability }) {
  if (availability === "AVAILABLE") {
    return <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Data available</span>;
  }
  if (availability === "PARTIAL") {
    return <span className="text-xs text-yellow-600 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Partial data</span>;
  }
  return <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Data unavailable</span>;
}

function CollapsibleSection({ title, icon, defaultOpen = false, children, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
          {badge && badge}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100 p-5">{children}</div>}
    </div>
  );
}

// ─── Section Renderers ────────────────────────────────────────────────────────

function ExecutionRealityCheck({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 italic">No input data available.</p>;
  return (
    <div className="space-y-4">
      {data.map((item, i) => {
        const pct = item.completionPct;
        const barPct = pct !== null ? Math.min(100, pct) : null;
        return (
          <div key={i} className="rounded-lg border border-gray-100 p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-gray-900 text-sm">{item.inputName}</div>
              <DataBadge availability={item.dataAvailability} />
            </div>
            <div className="text-xs text-gray-500 mb-3">
              Target: {item.targetQty ?? "—"} {item.unit} / {item.targetFrequency}
              {item.actualCompleted !== null && (
                <> · Actual: <span className="font-mono font-semibold text-gray-900">{item.actualCompleted} {item.unit}</span></>
              )}
              {item.shortfallOrExcess !== null && item.shortfallOrExcess !== 0 && (
                <> · <span className={item.shortfallOrExcess < 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                  {item.shortfallOrExcess > 0 ? `+${item.shortfallOrExcess}` : item.shortfallOrExcess} {item.unit}
                </span></>
              )}
            </div>
            {barPct !== null ? (
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Completion</span>
                  <span className={`font-bold ${pct >= 90 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"}`}>{pct}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic mb-2">Completion: UNKNOWN — no execution data recorded for this period</div>
            )}
            {item.milestoneImpact && (
              <p className="text-xs text-gray-600 mt-2 leading-relaxed border-t border-gray-100 pt-2">{item.milestoneImpact}</p>
            )}
            {item.evidenceSummary && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.evidenceSummary}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CommitmentAccountability({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-4 text-sm">
      {data.fulfilled?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">✓ Fulfilled</div>
          <ul className="space-y-1">{data.fulfilled.map((c, i) => <li key={i} className="text-gray-700 pl-3 border-l-2 border-green-400">{c}</li>)}</ul>
        </div>
      )}
      {data.partiallyFulfilled?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-yellow-700 uppercase tracking-wider mb-2">◑ Partially Fulfilled</div>
          <ul className="space-y-1">{data.partiallyFulfilled.map((c, i) => <li key={i} className="text-gray-700 pl-3 border-l-2 border-yellow-400">{c}</li>)}</ul>
        </div>
      )}
      {data.missed?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">✗ Missed</div>
          <ul className="space-y-1">{data.missed.map((c, i) => <li key={i} className="text-gray-700 pl-3 border-l-2 border-red-400">{c}</li>)}</ul>
        </div>
      )}
      {data.evidenceSummary && (
        <div className="bg-gray-50 rounded-lg p-3 text-gray-600 text-sm leading-relaxed">{data.evidenceSummary}</div>
      )}
      {data.followUpQuestions?.length > 0 && (
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="text-xs font-semibold text-orange-800 uppercase tracking-wider mb-2">Follow-Up Questions</div>
          <ul className="space-y-2">
            {data.followUpQuestions.map((q, i) => (
              <li key={i} className="text-sm text-orange-900 flex gap-2">
                <span className="text-orange-500 font-bold shrink-0">?</span>{q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ComfortVsWork({ data }) {
  if (!data) return null;
  if (!data.applicable) {
    return <p className="text-sm text-gray-500 italic">No evidence of comfort-driven avoidance identified in this period.</p>;
  }
  return (
    <div className="space-y-5 text-sm">
      {data.cases?.map((c, i) => (
        <div key={i} className="rounded-lg border border-orange-100 bg-orange-50 p-4">
          <div className="grid gap-2">
            <div>
              <span className="text-xs font-semibold text-orange-700 uppercase">Committed</span>
              <p className="text-gray-900 font-medium">{c.committed}</p>
            </div>
            {c.didInstead && (
              <div>
                <span className="text-xs font-semibold text-orange-700 uppercase">Did Instead</span>
                <p className="text-gray-700">{c.didInstead}</p>
              </div>
            )}
            <div>
              <span className="text-xs font-semibold text-orange-700 uppercase">Opportunity Lost</span>
              <p className="text-gray-700">{c.opportunityLost}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
              <div className="bg-white rounded p-2 border border-orange-100">
                <div className="text-xs text-orange-600 font-semibold mb-1">Milestone Risk</div>
                <p className="text-xs text-gray-700">{c.milestoneRelevance}</p>
              </div>
              <div className="bg-white rounded p-2 border border-orange-100">
                <div className="text-xs text-orange-600 font-semibold mb-1">Quarterly Risk</div>
                <p className="text-xs text-gray-700">{c.quarterlyRisk}</p>
              </div>
              <div className="bg-white rounded p-2 border border-orange-100">
                <div className="text-xs text-orange-600 font-semibold mb-1">5-Year Risk</div>
                <p className="text-xs text-gray-700">{c.fiveYearRisk}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
      {data.closingNote && (
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm leading-relaxed">
          {data.closingNote}
        </div>
      )}
    </div>
  );
}

function StrategicAlignment({ data }) {
  if (!data || data.length === 0) return null;
  const recColors = {
    Retain: "text-green-700 bg-green-100",
    Investigate: "text-yellow-700 bg-yellow-100",
    Increase: "text-blue-700 bg-blue-100",
    Decrease: "text-orange-700 bg-orange-100",
    Replace: "text-red-700 bg-red-100",
    Remove: "text-red-700 bg-red-200",
  };
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-100 p-4 bg-white">
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold text-gray-900 text-sm">{item.inputName}</div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${recColors[item.recommendation] || "bg-gray-100 text-gray-600"}`}>
              {item.recommendation}
            </span>
          </div>
          <div className="text-xs text-gray-500 flex flex-wrap gap-3 mb-2">
            <span>Type: <strong>{item.indicatorType}</strong></span>
            <span>Target clarity: <strong>{item.targetClarity}</strong></span>
            {item.overlapsWithOtherInput && <span className="text-yellow-600 font-semibold">⚠ Overlap detected</span>}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{item.relationToObjective}</p>
          {item.timeDisplacementRisk && (
            <p className="text-xs text-orange-700 mt-2">⚠ {item.timeDisplacementRisk}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function RootCauses({ data }) {
  if (!data || data.length === 0) return null;
  const catColors = {
    Behavioral: "bg-red-100 text-red-700",
    Strategic: "bg-purple-100 text-purple-700",
    Operational: "bg-blue-100 text-blue-700",
    Environmental: "bg-green-100 text-green-700",
  };
  return (
    <div className="space-y-4">
      {data.map((rc, i) => (
        <div key={i} className="rounded-lg border border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-500">#{i + 1}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${catColors[rc.category] || "bg-gray-100 text-gray-600"}`}>
              {rc.category}
            </span>
            <ConfidenceBadge level={rc.confidence} />
          </div>
          <p className="font-semibold text-gray-900 text-sm mb-2">{rc.finding}</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <span className="font-medium text-gray-700">Evidence: </span>{rc.evidence}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-medium text-gray-700">Consequence: </span>{rc.consequence}
          </p>
          {rc.additionalInfoNeeded && (
            <p className="text-xs text-orange-700 mt-2 bg-orange-50 rounded p-2">
              <span className="font-semibold">To increase confidence: </span>{rc.additionalInfoNeeded}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ConsequenceProjection({ data }) {
  if (!data) return null;
  const levels = [
    { key: "inputLevel", label: "Operating Inputs" },
    { key: "milestoneLevel", label: "Current Milestone" },
    { key: "quarterlyLevel", label: "Quarterly Goal / ROCK" },
    { key: "annualLevel", label: "Annual Goal" },
    { key: "fiveYearLevel", label: "5-Year Objective" },
  ];
  return (
    <div className="space-y-3">
      {levels.map(({ key, label }) => {
        const level = data[key];
        if (!level) return null;
        return (
          <div key={key} className="flex gap-4 items-start p-3 rounded-lg border border-gray-100 bg-gray-50">
            <div className="w-36 shrink-0">
              <div className="text-xs font-semibold text-gray-500">{label}</div>
              <StatusBadge status={level.status} />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{level.detail}</p>
          </div>
        );
      })}
      {data.recoveryRate && (
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100 text-sm text-orange-900">
          <span className="font-semibold">Recovery rate required: </span>{data.recoveryRate}
        </div>
      )}
    </div>
  );
}

function BehavioralWeaknessUpdate({ data }) {
  if (!data || data.length === 0) return (
    <p className="text-sm text-gray-400 italic">No behavioral patterns identified or updated.</p>
  );
  const statusColors = {
    "Suspected": "bg-gray-100 text-gray-600",
    "Evidence emerging": "bg-yellow-100 text-yellow-700",
    "Confirmed recurring pattern": "bg-red-100 text-red-700",
    "Improving": "bg-blue-100 text-blue-700",
    "Resolved": "bg-green-100 text-green-700",
    "Reopened": "bg-orange-100 text-orange-700",
  };
  return (
    <div className="space-y-4">
      {data.map((bw, i) => (
        <div key={i} className={`rounded-lg border p-4 ${bw.isNew ? "border-orange-200 bg-orange-50" : "border-gray-100 bg-white"}`}>
          {bw.isNew && <div className="text-xs font-semibold text-orange-600 mb-2">NEW PATTERN IDENTIFIED</div>}
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold text-gray-900 text-sm">{bw.pattern}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ml-2 ${statusColors[bw.proposedStatus] || "bg-gray-100 text-gray-600"}`}>
              {bw.proposedStatus}
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">{bw.evidenceFromThisPeriod}</p>
          {bw.triggeringSituation && (
            <p className="text-xs text-gray-500 mb-2"><span className="font-medium">Trigger: </span>{bw.triggeringSituation}</p>
          )}
          <div className="bg-gray-50 rounded p-3 mt-2 text-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 mb-1">Proposed Intervention</div>
            <p className="text-gray-700">{bw.proposedIntervention}</p>
            <div className="text-xs font-semibold text-gray-500 mt-2 mb-1">Verification Criteria</div>
            <p className="text-gray-600">{bw.verificationCriteria}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Verdict({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-4 text-sm">
      <div className="bg-gray-900 text-gray-100 rounded-xl p-5">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Overall Assessment</div>
        <p className="leading-relaxed text-base">{data.overallAssessment}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-red-100 bg-red-50 p-4">
          <div className="text-xs font-semibold text-red-700 uppercase mb-1">Most Consequential Gap</div>
          <p className="text-gray-900">{data.mostConsequentialGap}</p>
        </div>
        <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
          <div className="text-xs font-semibold text-orange-700 uppercase mb-1">Primary Root Cause</div>
          <p className="text-gray-900">{data.mostImportantRootCause}</p>
        </div>
        <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
          <div className="text-xs font-semibold text-yellow-700 uppercase mb-1">Greatest Risk</div>
          <p className="text-gray-900">{data.greatestRisk}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Unresolved Questions</div>
          {data.unresolvedQuestions?.length > 0 ? (
            <ul className="space-y-1">
              {data.unresolvedQuestions.map((q, i) => <li key={i} className="text-gray-700">• {q}</li>)}
            </ul>
          ) : <p className="text-gray-400 italic">None</p>}
        </div>
      </div>
      {data.highestPriorityAction && (
        <div className="rounded-xl border border-gray-900 bg-gray-900 text-white p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Highest Priority Action</div>
          <p className="font-bold text-lg mb-3">{data.highestPriorityAction.exactAction}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
            <div><span className="text-gray-500">Target: </span>{data.highestPriorityAction.measurableTarget}</div>
            <div><span className="text-gray-500">Deadline: </span>{data.highestPriorityAction.deadlineOrFrequency}</div>
            <div><span className="text-gray-500">Goal: </span>{data.highestPriorityAction.relatedGoal}</div>
            <div><span className="text-gray-500">Verify via: </span>{data.highestPriorityAction.verificationMethod}</div>
          </div>
          {data.highestPriorityAction.reviewCondition && (
            <p className="text-xs text-gray-400 mt-2 border-t border-gray-700 pt-2">
              Review condition: {data.highestPriorityAction.reviewCondition}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CorrectiveActions({ data, onAccept, onReject, accepted, rejected }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="space-y-4">
      {data.map((action, i) => {
        const isAccepted = accepted.includes(i);
        const isRejected = rejected.includes(i);
        return (
          <div
            key={i}
            className={`rounded-lg border p-4 transition-colors ${
              isAccepted ? "border-green-300 bg-green-50" :
              isRejected ? "border-gray-200 bg-gray-50 opacity-60" :
              "border-gray-200 bg-white"
            }`}
          >
            <p className="font-semibold text-gray-900 text-sm mb-3">{action.exactAction}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
              <div><span className="font-medium">Target: </span>{action.measurableTarget}</div>
              <div><span className="font-medium">Deadline: </span>{action.deadlineOrFrequency}</div>
              <div><span className="font-medium">Goal: </span>{action.relatedGoalOrInput}</div>
              <div><span className="font-medium">Verify: </span>{action.verificationMethod}</div>
            </div>
            {action.reviewCondition && (
              <p className="text-xs text-gray-400 mb-3 italic">Review condition: {action.reviewCondition}</p>
            )}
            {!isAccepted && !isRejected && (
              <div className="flex gap-2">
                <button
                  onClick={() => onAccept(i)}
                  className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => onReject(i)}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
            {isAccepted && <div className="text-xs text-green-700 font-semibold">✓ Accepted — will pass to Input Evolution</div>}
            {isRejected && <div className="text-xs text-gray-500 font-semibold">Rejected</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIInvestigation({
  reviewState,
  setReviewState,
  onNext,
  onBack,
  reviewContext,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryable, setRetryable] = useState(false);
  const [acceptedActions, setAcceptedActions] = useState([]);
  const [rejectedActions, setRejectedActions] = useState([]);

  // Use a ref to track whether we've already initiated the investigation for this session
  // This prevents the infinite re-run caused by setReviewState changing on every render
  const hasInitiated = useRef(false);

  const runInvestigation = async () => {
    const dataPayload = reviewState.assembledDataPayload;

    if (!dataPayload) {
      setError(
        "No assembled data payload found. Please go back to Data Assembly and assemble the data first."
      );
      setRetryable(false);
      return;
    }

    if (!dataPayload.system) {
      setError("Data payload is missing system information. Please go back to Data Assembly.");
      setRetryable(false);
      return;
    }

    if (!dataPayload.inputs || dataPayload.inputs.length === 0) {
      setError("No active inputs found in the assembled data. Add inputs before running the investigation.");
      setRetryable(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        reviewType: reviewContext?.type || "WEEKLY",
        dataPayload,
      };

      const res = await fetch("/api/ai/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const isRetryable = data.retryable !== false;
        setRetryable(isRetryable);
        throw new Error(data.error || `Server error (${res.status})`);
      }

      // Store the analysis and mark investigation as complete
      setReviewState((prev) => ({
        ...prev,
        aiAnalysis: data,
        investigationComplete: true,
      }));
    } catch (err) {
      setError(err.message);
      if (err.message && (err.message.includes("GROQ_API_KEY") || err.message.includes("authentication"))) {
        setRetryable(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-run investigation when entering this stage, but only once per session
  useEffect(() => {
    if (hasInitiated.current) return;
    if (reviewState.aiAnalysis) {
      // Already have analysis — restore accepted/rejected state
      hasInitiated.current = true;
      return;
    }
    hasInitiated.current = true;
    runInvestigation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    setError(null);
    setRetryable(false);
    runInvestigation();
  };

  const analysis = reviewState.aiAnalysis;

  // Handle corrective action acceptance — pass to review state for Input Evolution
  const handleAccept = (i) => {
    setAcceptedActions((prev) => [...prev, i]);
    const action = analysis?.correctiveActions?.[i];
    if (action) {
      setReviewState((prev) => ({
        ...prev,
        acceptedCorrectiveActions: [...(prev.acceptedCorrectiveActions || []), action],
      }));
    }
  };

  const handleReject = (i) => {
    setRejectedActions((prev) => [...prev, i]);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Investigation</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Evidence-driven analysis of your execution, behavioral patterns, and strategic alignment.
        </p>
      </div>

      <div className="space-y-5">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-orange-100 bg-orange-50">
            <BrainCircuit className="w-10 h-10 animate-pulse text-orange-500 mb-4" />
            <div className="text-sm font-semibold text-orange-900 mb-1">Investigating System...</div>
            <div className="text-xs text-orange-600 text-center max-w-xs">
              Analyzing execution data, behavioral patterns, and strategic alignment. This may take 20–40 seconds.
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-red-800 mb-1">Investigation Failed</div>
                <p className="text-sm text-red-700 mb-3 leading-relaxed">{error}</p>
                {error.includes("GROQ_API_KEY") && (
                  <p className="text-xs text-red-600 bg-red-100 rounded p-2 mb-3">
                    The GROQ_API_KEY environment variable is not configured in the deployment environment.
                    Add it to your Vercel (or hosting provider) environment variables and redeploy.
                    The .env.local file is not included in production builds.
                  </p>
                )}
                {retryable && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry Investigation
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No assembled data warning */}
        {!loading && !error && !reviewState.assembledDataPayload && !analysis && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-sm text-yellow-800">
            <div className="font-semibold mb-1">Data assembly required</div>
            <p>Please go back to the Data Assembly stage and assemble your execution data before running the investigation.</p>
          </div>
        )}

        {/* Full investigation report */}
        {analysis && !loading && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-gray-900 text-gray-100 rounded-xl p-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Investigation Summary
              </div>
              <p className="text-sm leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Mandatory Notes */}
            {analysis.mandatoryNotes?.length > 0 && (
              <div className="space-y-2">
                {analysis.mandatoryNotes.map((note, i) => (
                  <div key={i} className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900 leading-relaxed">
                    {note}
                  </div>
                ))}
              </div>
            )}

            {/* A: Execution Reality Check */}
            <CollapsibleSection
              title="A. Execution Reality Check"
              icon={<Target className="w-4 h-4 text-orange-500" />}
              defaultOpen={true}
            >
              <ExecutionRealityCheck data={analysis.executionRealityCheck} />
            </CollapsibleSection>

            {/* B: Commitment & Accountability */}
            <CollapsibleSection
              title="B. Commitment & Personal Accountability"
              icon={<Shield className="w-4 h-4 text-blue-500" />}
              defaultOpen={true}
            >
              <CommitmentAccountability data={analysis.commitmentAccountability} />
            </CollapsibleSection>

            {/* C: Comfort vs Work */}
            <CollapsibleSection
              title="C. The Cost of Choosing Comfort"
              icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
              defaultOpen={analysis.comfortVsWork?.applicable}
            >
              <ComfortVsWork data={analysis.comfortVsWork} />
            </CollapsibleSection>

            {/* D: Strategic Alignment */}
            <CollapsibleSection
              title="D. Strategic Alignment Investigation"
              icon={<Eye className="w-4 h-4 text-purple-500" />}
              defaultOpen={false}
            >
              <StrategicAlignment data={analysis.strategicAlignment} />
            </CollapsibleSection>

            {/* E: Root Cause Analysis */}
            <CollapsibleSection
              title="E. Root-Cause Analysis"
              icon={<Zap className="w-4 h-4 text-yellow-500" />}
              defaultOpen={true}
            >
              <RootCauses data={analysis.rootCauses} />
            </CollapsibleSection>

            {/* F: Consequence Projection */}
            <CollapsibleSection
              title="F. Consequence Projection"
              icon={<TrendingDown className="w-4 h-4 text-red-500" />}
              defaultOpen={true}
            >
              <ConsequenceProjection data={analysis.consequenceProjection} />
            </CollapsibleSection>

            {/* G: Behavioral Weakness Update */}
            <CollapsibleSection
              title="G. Identity & Behavioral Evolution"
              icon={<BrainCircuit className="w-4 h-4 text-indigo-500" />}
              defaultOpen={false}
            >
              <BehavioralWeaknessUpdate data={analysis.behavioralWeaknessUpdate} />
            </CollapsibleSection>

            {/* H: Verdict */}
            <CollapsibleSection
              title="H. Investigation Verdict"
              icon={<CheckCircle className="w-4 h-4 text-green-600" />}
              defaultOpen={true}
            >
              <Verdict data={analysis.verdict} />
            </CollapsibleSection>

            {/* Corrective Actions (reviewable) */}
            {analysis.correctiveActions?.length > 0 && (
              <CollapsibleSection
                title="Proposed Corrective Actions"
                icon={<RefreshCw className="w-4 h-4 text-orange-500" />}
                defaultOpen={true}
              >
                <div className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Review and accept or reject each proposed action. Accepted actions will be passed
                  to the Input Evolution stage for review before any changes are committed.
                </div>
                <CorrectiveActions
                  data={analysis.correctiveActions}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  accepted={acceptedActions}
                  rejected={rejectedActions}
                />
              </CollapsibleSection>
            )}

            {/* Retry button for completed investigation */}
            <div className="text-center">
              <button
                onClick={handleRetry}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
              >
                <RefreshCw className="w-3 h-3" /> Re-run investigation with fresh analysis
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="pt-8 flex justify-between items-center mt-8 border-t border-gray-100">
        <button
          onClick={onBack}
          className="text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          Verify Milestone <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
