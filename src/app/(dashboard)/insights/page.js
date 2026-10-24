"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const INSIGHTS_STORAGE_KEY = "working-ledger-insights";

const PRIORITY_STYLES = {
  High: "border-red-200 bg-red-50 text-red-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-blue-200 bg-blue-50 text-blue-700",
};

export default function InsightsCenter() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [system, setSystem] = useState(null);
  const [dataPayload, setDataPayload] = useState(null);
  const [insights, setInsights] = useState([]);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [error, setError] = useState("");
  const [dataCounts, setDataCounts] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Find the user's active system.
      const {
        data: {
          user,
        },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!user) {
        throw new Error("You must be signed in to view insights.");
      }

      const {
        data: activeSystem,
        error: systemError,
      } = await supabase
        .from("systems")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (systemError) {
        throw new Error(
          `Could not load your active system: ${systemError.message}`
        );
      }

      if (!activeSystem) {
        setSystem(null);
        setDataPayload(null);
        setDataCounts({});
        setInsights([]);
        setGeneratedAt(null);
        setError(
          "No active system was found. Activate a system before generating insights."
        );
        return;
      }

      setSystem(activeSystem);

      // 2. Fetch the tables used by the insights engine.
      const [
        reviewsResult,
        experimentsResult,
        inputsResult,
        metricsResult,
        definitionsResult,
      ] = await Promise.all([
        supabase
          .from("reviews")
          .select("*")
          .eq("system_id", activeSystem.id)
          .order("created_at", { ascending: false })
          .limit(100),

        supabase
          .from("experiments")
          .select("*")
          .eq("system_id", activeSystem.id)
          .order("created_at", { ascending: false })
          .limit(100),

        supabase
          .from("input_definitions")
          .select("*")
          .eq("system_id", activeSystem.id)
          .limit(200),

        supabase
          .from("metrics")
          .select("*")
          .eq("system_id", activeSystem.id)
          .limit(200),

        supabase
          .from("result_definitions")
          .select("*")
          .eq("system_id", activeSystem.id)
          .limit(200),
      ]);

      const tableResults = [
        ["reviews", reviewsResult],
        ["experiments", experimentsResult],
        ["input definitions", inputsResult],
        ["metrics", metricsResult],
        ["result definitions", definitionsResult],
      ];

      for (const [tableName, result] of tableResults) {
        if (result.error) {
          throw new Error(
            `Could not load ${tableName}: ${result.error.message}`
          );
        }
      }

      const reviews = reviewsResult.data ?? [];
      const experiments = experimentsResult.data ?? [];
      const inputDefinitions = inputsResult.data ?? [];
      const metrics = metricsResult.data ?? [];
      const resultDefinitions = definitionsResult.data ?? [];

      // 3. Fetch daily input entries only if input definitions exist.
      let dailyInputEntries = [];

      if (inputDefinitions.length > 0) {
        const inputDefinitionIds = inputDefinitions.map((item) => item.id);

        const {
          data,
          error: dailyInputsError,
        } = await supabase
          .from("daily_input_entries")
          .select("*")
          .in("input_definition_id", inputDefinitionIds)
          .order("date", { ascending: false })
          .limit(2000);

        if (dailyInputsError) {
          throw new Error(
            `Could not load daily input entries: ${dailyInputsError.message}`
          );
        }

        dailyInputEntries = data ?? [];
      }

      // 4. Fetch result records only if result definitions exist.
      let resultRecords = [];

      if (resultDefinitions.length > 0) {
        const resultDefinitionIds = resultDefinitions.map(
          (item) => item.id
        );

        const {
          data,
          error: resultRecordsError,
        } = await supabase
          .from("result_records")
          .select("*")
          .in("result_definition_id", resultDefinitionIds)
          .order("period_start", { ascending: false })
          .limit(2000);

        if (resultRecordsError) {
          throw new Error(
            `Could not load result records: ${resultRecordsError.message}`
          );
        }

        resultRecords = data ?? [];
      }

      // 5. Assemble the real database records.
      // There is deliberately no system_versions table here.
      const payload = {
        system: activeSystem,
        reviews,
        experiments,
        input_definitions: inputDefinitions,
        daily_input_entries: dailyInputEntries,
        metrics,
        result_definitions: resultDefinitions,
        result_records: resultRecords,
      };

      setDataPayload(payload);

      setDataCounts({
        reviews: reviews.length,
        experiments: experiments.length,
        inputDefinitions: inputDefinitions.length,
        dailyInputEntries: dailyInputEntries.length,
        metrics: metrics.length,
        resultDefinitions: resultDefinitions.length,
        resultRecords: resultRecords.length,
      });

      // Restore the most recently generated insights for this system.
      try {
        const stored = sessionStorage.getItem(INSIGHTS_STORAGE_KEY);

        if (stored) {
          const parsed = JSON.parse(stored);

          if (parsed.systemId === activeSystem.id) {
            setInsights(
              Array.isArray(parsed.insights) ? parsed.insights : []
            );
            setGeneratedAt(parsed.generatedAt ?? null);
          } else {
            setInsights([]);
            setGeneratedAt(null);
          }
        } else {
          setInsights([]);
          setGeneratedAt(null);
        }
      } catch (storageError) {
        console.warn(
          "[Insights] Could not restore saved insights:",
          storageError
        );
        setInsights([]);
        setGeneratedAt(null);
      }
    } catch (fetchError) {
      console.error("[Insights] Data loading failed:", fetchError);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "An unexpected error occurred while loading insights data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSynthesize = async () => {
    if (!dataPayload) {
      setError("System data is not loaded. Refresh and try again.");
      return;
    }

    setSynthesizing(true);
    setError("");

    try {
      console.info("[Insights] Starting synthesis.", {
        systemId: system?.id,
        dataCounts,
      });

      // Read the response as text first so HTML or empty error pages
      // don't cause a misleading JSON parsing error.
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ dataPayload }),
      });

      const responseText = await response.text();

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        console.error("[Insights] Non-JSON API response:", {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get("content-type"),
          body: responseText.slice(0, 5000),
        });

        throw new Error(
          `The Insights API returned HTTP ${response.status} without valid JSON. ` +
            `Response: ${responseText.slice(0, 500) || "(empty response)"}. ` +
            "Check your Next.js server terminal for the underlying error."
        );
      }

      if (!response.ok) {
        console.error("[Insights] API returned an error:", {
          status: response.status,
          result,
        });

        throw new Error(
          result?.error ||
            `The Insights API failed with HTTP ${response.status}.`
        );
      }

      if (!Array.isArray(result?.insights)) {
        console.error("[Insights] Unexpected API response:", result);
        throw new Error(
          "The API response is missing the expected insights array."
        );
      }

      // Save and display the generated insights.
      const timestamp = result.generatedAt || new Date().toISOString();

      setInsights(result.insights);
      setGeneratedAt(timestamp);

      try {
        sessionStorage.setItem(
          INSIGHTS_STORAGE_KEY,
          JSON.stringify({
            systemId: system?.id,
            insights: result.insights,
            generatedAt: timestamp,
          })
        );
      } catch (storageError) {
        // The insights still display even if session storage is unavailable.
        console.warn(
          "[Insights] Could not save insights in session storage:",
          storageError
        );
      }

      console.info("[Insights] Synthesis completed.", {
        count: result.insights.length,
        generatedAt: timestamp,
      });
    } catch (synthesisError) {
      console.error("[Insights] Synthesis failed:", synthesisError);

      setError(
        synthesisError instanceof Error
          ? synthesisError.message
          : "An unexpected error occurred while generating insights."
      );
    } finally {
      setSynthesizing(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex min-h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500">
            Loading your system data...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
            <Brain className="h-4 w-4" />
            Working Ledger
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Insights Center
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Analyze your execution, inputs, bottlenecks, and progress
            using the records in your active system.
          </p>

          {system && (
            <p className="mt-3 text-sm text-gray-500">
              Active system:{" "}
              <span className="font-semibold text-gray-800">
                {system.name}
              </span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={synthesizing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh data
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div className="min-w-0">
              <h2 className="font-semibold text-red-900">
                Something went wrong
              </h2>

              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-red-800">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {!system ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Brain className="mx-auto h-10 w-10 text-gray-400" />

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No active system
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
            Activate a system before generating insights from your
            execution and result records.
          </p>
        </div>
      ) : (
        <>
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />

                  <h2 className="text-lg font-semibold text-gray-900">
                    AI synthesis
                  </h2>
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                  Generate evidence-based findings from the records
                  currently available for this system. The AI should
                  distinguish observed facts from possible explanations.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSynthesize}
                disabled={synthesizing || !dataPayload}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {synthesizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Synthesize insights
                  </>
                )}
              </button>
            </div>

            {synthesizing && (
              <div className="mt-5 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
                Analyzing the available records. This may take a little
                time.
              </div>
            )}
          </section>

          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Data available for analysis
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                These counts show the records loaded for the active system.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <DataCount label="Reviews" value={dataCounts.reviews} />
              <DataCount
                label="Experiments"
                value={dataCounts.experiments}
              />
              <DataCount
                label="Input definitions"
                value={dataCounts.inputDefinitions}
              />
              <DataCount
                label="Daily input entries"
                value={dataCounts.dailyInputEntries}
              />
              <DataCount label="Metrics" value={dataCounts.metrics} />
              <DataCount
                label="Result definitions"
                value={dataCounts.resultDefinitions}
              />
              <DataCount
                label="Result records"
                value={dataCounts.resultRecords}
              />
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Generated insights
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Findings and suggested next actions.
                </p>
              </div>

              {generatedAt && (
                <p className="text-xs text-gray-500">
                  Generated {new Date(generatedAt).toLocaleString()}
                </p>
              )}
            </div>

            {insights.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <Brain className="mx-auto h-9 w-9 text-gray-400" />

                <h3 className="mt-4 font-semibold text-gray-900">
                  No insights generated yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                  Select Synthesize insights to analyze your available
                  system records.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <InsightCard
                    key={`${insight.category}-${index}`}
                    insight={insight}
                    index={index}
                    onOpen={() => {
                      try {
                        sessionStorage.setItem(
                          INSIGHTS_STORAGE_KEY,
                          JSON.stringify({
                            systemId: system.id,
                            insights,
                            generatedAt,
                          })
                        );
                      } catch (storageError) {
                        console.warn(
                          "[Insights] Could not save insights before navigation:",
                          storageError
                        );
                      }

                      router.push(`/insights/${index}`);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function DataCount({ label, value = 0 }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-2 text-2xl font-semibold tabular-nums text-gray-900">
        {value ?? 0}
      </p>
    </div>
  );
}

function InsightCard({ insight, index, onOpen }) {
  const priority = PRIORITY_STYLES[insight.priority] ||
    "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-700">
            {index + 1}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              {insight.category || "Insight"}
            </p>

            <h3 className="mt-1 text-base font-semibold leading-6 text-gray-900">
              {insight.observed_fact}
            </h3>
          </div>
        </div>

        <span
          className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${priority}`}
        >
          {insight.priority || "Unranked"} priority
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <InsightSection title="Evidence" content={insight.evidence} />

        <InsightSection
          title="Possible explanation"
          content={insight.ai_hypothesis}
        />

        <InsightSection
          title="Recommended action"
          content={insight.recommended_action}
        />

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Success metric
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-800">
            {insight.success_metric || "No success metric provided."}
          </p>

          <p className="mt-3 text-xs text-gray-500">
            Review after {insight.review_after_days ?? "—"} day(s)
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
        >
          View details
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function InsightSection({ title, content }) {
  if (!content) return null;

  return (
    <div>
      <p className="text-sm font-semibold text-gray-800">{title}</p>

      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-600">
        {content}
      </p>
    </div>
  );
}