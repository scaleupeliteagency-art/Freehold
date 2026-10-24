
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  AlertCircle,
  Beaker,
  CheckCircle2,
  Clock3,
  Target,
  Zap,
} from "lucide-react";

const STORAGE_KEY = "working-ledger-insights";

const PRIORITY_STYLES = {
  High: "border-red-500/30 bg-red-500/10 text-red-300",
  Medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  Low: "border-green-500/30 bg-green-500/10 text-green-300",
};

export default function InsightDetailView() {
  const params = useParams();
  const router = useRouter();

  const [insight, setInsight] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setError(
          "This insight is not available in the current browser session. Return to the Insights Archive and synthesize the insights again."
        );
        return;
      }

      const saved = JSON.parse(raw);
      const insightIndex = Number(params.id);

      if (
        !Number.isInteger(insightIndex) ||
        insightIndex < 0 ||
        !Array.isArray(saved.insights) ||
        !saved.insights[insightIndex]
      ) {
        setError(
          "This insight could not be found. Return to the Insights Archive and generate the insights again."
        );
        return;
      }

      setInsight(saved.insights[insightIndex]);
      setMetadata({
        systemName: saved.systemName,
        generatedAt: saved.generatedAt,
      });
    } catch (err) {
      console.error("Could not load insight details:", err);
      setError("Unable to read the saved insight in this browser session.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-gray-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
        <span className="text-sm">Loading insight...</span>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <button
          type="button"
          onClick={() => router.push("/insights")}
          className="mb-8 flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Insights Archive
        </button>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <AlertCircle className="mb-3 h-6 w-6 text-amber-700" />
          <h1 className="text-xl font-semibold text-gray-900">
            Insight unavailable
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            {error || "The requested insight could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/insights")}
            className="mt-5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
          >
            Return to Insights
          </button>
        </div>
      </div>
    );
  }

  const priorityStyle =
    PRIORITY_STYLES[insight.priority] || PRIORITY_STYLES.Medium;

  return (
    <div className="mx-auto w-full pb-12">
      <button
        type="button"
        onClick={() => router.push("/insights")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Insights Archive
      </button>

      <header className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0B0E] p-6 shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-orange-600/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
              {insight.category}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyle}`}
            >
              {insight.priority} Priority
            </span>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
              <Zap className="h-6 w-6 text-orange-400" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Insight Detail
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {insight.category}
              </h1>
            </div>
          </div>

          <p className="max-w-3xl text-sm leading-7 text-gray-300">
            {insight.observed_fact}
          </p>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">
            {metadata?.systemName && (
              <span>System: {metadata.systemName}</span>
            )}

            {metadata?.generatedAt && (
              <span>
                Generated:{" "}
                {new Date(metadata.generatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DetailSection
            title="Observed Fact"
            subtitle="What the available data actually shows"
            icon={<Activity className="h-5 w-5" />}
            iconStyle="bg-blue-50 text-blue-700"
          >
            <p className="text-sm leading-7 text-gray-800">
              {insight.observed_fact}
            </p>
          </DetailSection>

          <DetailSection
            title="Supporting Evidence"
            subtitle="Evidence and data limitations"
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconStyle="bg-gray-100 text-gray-700"
          >
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
              {insight.evidence}
            </p>
          </DetailSection>

          <DetailSection
            title="AI Hypothesis"
            subtitle="A possible explanation, not a proven cause"
            icon={<Beaker className="h-5 w-5" />}
            iconStyle="bg-orange-50 text-orange-700"
          >
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
              {insight.ai_hypothesis}
            </p>
          </DetailSection>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-emerald-950">
                  Recommended Action
                </h2>
                <p className="mt-0.5 text-xs text-emerald-800">
                  Your next step
                </p>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-7 text-emerald-950">
              {insight.recommended_action}
            </p>

            <div className="mt-5 border-t border-emerald-200 pt-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                Success Metric
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-6 text-emerald-950">
                {insight.success_metric}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-white/70 p-3 text-sm font-medium text-emerald-900">
              <Clock3 className="h-4 w-4 shrink-0" />
              Review after {insight.review_after_days} day
              {insight.review_after_days === 1 ? "" : "s"}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              How to interpret this insight
            </h2>

            <div className="space-y-3 text-sm leading-6 text-gray-600">
              <p>
                <span className="font-semibold text-gray-900">
                  Fact:
                </span>{" "}
                supported by the supplied records.
              </p>

              <p>
                <span className="font-semibold text-gray-900">
                  Hypothesis:
                </span>{" "}
                a possible explanation that still needs testing.
              </p>

              <p>
                <span className="font-semibold text-gray-900">
                  Action:
                </span>{" "}
                the proposed next step to test or address the finding.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  subtitle,
  icon,
  iconStyle,
  children,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
        >
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>

      {children}
    </section>
  );
}
