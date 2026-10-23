
"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  AlertCircle,
  ShieldCheck,
  Search,
  LockKeyhole,
  LoaderCircle,
  RefreshCw,
  ClipboardCheck,
  Target,
  ChevronDown,
  Zap,
  ShieldAlert,
  GitBranch,
  Check,
  CircleHelp,
  CalendarCheck,
  ClipboardList,
  TrendingUp,
  Gauge,
} from "lucide-react";

export default function MilestoneVerification({
  reviewState,
  setReviewState,
  onNext,
  onBack,
}) {
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submittingAnswers, setSubmittingAnswers] = useState(false);
  const [error, setError] = useState("");

  const milestone = reviewState?.milestone;
  const decision = reviewState?.milestoneVerificationDecision ?? null;

  const investigation = reviewState?.milestoneInvestigation ?? {};
  const questions = investigation.questions ?? [];
  const answers = investigation.answers ?? {};
  const report = investigation.report ?? null;

  const isAchieved =
    decision === "achieved" ||
    (decision === null && reviewState?.milestoneAchieved === true);

  const investigationCompleted =
    reviewState?.milestoneInvestigationCompleted === true &&
    Boolean(report);

  const hasMilestone = Boolean(milestone?.id || milestone?.name);

  const dataPayload =
    reviewState?.assembledDataPayload ||
    reviewState?.dataPayload ||
    null;

  const reviewType = reviewState?.reviewType || "WEEKLY";

  const allQuestionsAnswered =
    questions.length > 0 &&
    questions.every(
      (question) =>
        question.required === false ||
        String(answers[question.id] ?? "").trim().length > 0
    );

  const canContinue =
    hasMilestone &&
    (isAchieved ||
      (decision === "not_achieved" && investigationCompleted));

  function updateInvestigation(updates) {
    setReviewState((previous) => ({
      ...previous,
      milestoneInvestigation: {
        ...(previous.milestoneInvestigation ?? {}),
        ...updates,
      },
    }));
  }

  function selectDecision(nextDecision) {
    setError("");

    setReviewState((previous) => ({
      ...previous,
      milestoneVerificationDecision: nextDecision,
      milestoneAchieved: nextDecision === "achieved",
      milestoneInvestigationCompleted: false,
      milestoneInvestigation: {
        questions: [],
        answers: {},
        report: null,
      },
    }));
  }

  async function startInvestigation() {
    if (!dataPayload) {
      setError(
        "Review data is missing. Ensure Data Assembly has completed before generating investigation questions."
      );
      return;
    }

    setLoadingQuestions(true);
    setError("");

    try {
      const response = await fetch("/api/ai/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_questions",
          reviewType,
          dataPayload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to generate investigation questions."
        );
      }

      if (
        !Array.isArray(result.questions) ||
        result.questions.length < 1
      ) {
        throw new Error(
          "The AI did not return valid investigation questions. Please retry."
        );
      }

      const normalizedQuestions = result.questions.map(
        (question, index) => ({
          ...question,
          id: question.id || `q${index + 1}`,
          question: question.question || `Question ${index + 1}`,
          reason: question.reason || "",
          evidence: question.evidence || "",
          answerType: question.answerType || "text",
          required: question.required !== false,
        })
      );

      updateInvestigation({
        questions: normalizedQuestions,
        answers: {},
        report: null,
      });

      setReviewState((previous) => ({
        ...previous,
        milestoneInvestigationCompleted: false,
      }));
    } catch (err) {
      setError(
        err.message || "Could not generate questions. Please try again."
      );
    } finally {
      setLoadingQuestions(false);
    }
  }

  function updateAnswer(questionId, value) {
    updateInvestigation({
      answers: { ...answers, [questionId]: value },
      report: null,
    });

    setReviewState((previous) => ({
      ...previous,
      milestoneInvestigationCompleted: false,
    }));
  }

  async function submitInvestigation() {
    if (!dataPayload) {
      setError("Review data is missing. Please return to Data Assembly.");
      return;
    }

    if (!allQuestionsAnswered) {
      setError("Answer every required investigation question before submitting.");
      return;
    }

    const investigationAnswers = questions.map((question) => ({
      id: question.id,
      question: question.question,
      reason: question.reason,
      answer: String(answers[question.id] ?? "").trim(),
    }));

    setSubmittingAnswers(true);
    setError("");

    try {
      const response = await fetch("/api/ai/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_answers",
          reviewType,
          dataPayload,
          investigationAnswers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "The AI investigation analysis failed."
        );
      }

      const analysis = result.analysis ?? result.report ?? result;

      if (
        !analysis ||
        typeof analysis !== "object" ||
        Array.isArray(analysis) ||
        (!analysis.summary &&
          !analysis.rootCauses &&
          !analysis.correctiveActions &&
          !analysis.verdict)
      ) {
        throw new Error(
          "The AI response did not contain a valid investigation report. Please retry."
        );
      }

      setReviewState((previous) => ({
        ...previous,
        milestoneInvestigation: {
          ...(previous.milestoneInvestigation ?? {}),
          questions,
          answers,
          report: analysis,
        },
        milestoneInvestigationCompleted: true,
      }));
    } catch (err) {
      setError(
        err.message ||
          "Analysis failed. Your answers remain available so you can retry."
      );
    } finally {
      setSubmittingAnswers(false);
    }
  }

  function handleNext() {
    if (!canContinue) return;
    onNext();
  }

  function formatLabel(value) {
    return String(value ?? "")
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatValue(value) {
    if (value == null || value === "") return "Not provided";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
    if (Array.isArray(value)) return value.map(formatValue).join(", ");
    return JSON.stringify(value, null, 2);
  }

  function renderSection(title, value, icon = null) {
    if (
      value == null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return null;
    }

    return (
      <details
        key={title}
        open={title === "Root Causes" || title === "Corrective Actions"}
        className="group overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-semibold text-gray-800">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>

        <div className="border-t border-gray-100 p-4">
          {Array.isArray(value) ? (
            <div className="space-y-3">
              {value.map((item, index) => (
                <div
                  key={item?.id || item?.title || index}
                  className="rounded-lg bg-gray-50 p-4"
                >
                  {typeof item === "object" && item !== null ? (
                    <div className="space-y-3">
                      {Object.entries(item).map(([key, itemValue]) => (
                        <div key={key}>
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {formatLabel(key)}
                          </div>
                          <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                            {formatValue(itemValue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                      {String(item)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : typeof value === "object" ? (
            <div className="space-y-4">
              {Object.entries(value).map(([key, itemValue]) => (
                <div key={key}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {formatLabel(key)}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {formatValue(itemValue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {String(value)}
            </p>
          )}
        </div>
      </details>
    );
  }

  function VerdictMetric({ icon: Icon, label, value, tone = "default" }) {
    const tones = {
      default: "bg-gray-50 text-gray-700",
      warning: "bg-amber-50 text-amber-900",
      danger: "bg-red-50 text-red-900",
      success: "bg-emerald-50 text-emerald-900",
    };

    return (
      <div className={`rounded-xl p-4 ${tones[tone] || tones.default}`}>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <p className="text-sm font-medium leading-relaxed">{formatValue(value)}</p>
      </div>
    );
  }

  function InvestigationVerdict({ verdict, summary }) {
    if (!verdict || typeof verdict !== "object") return null;

    const action = verdict.highestPriorityAction;
    const hasInputsToPreserve =
      Array.isArray(verdict.inputsToPreserve) &&
      verdict.inputsToPreserve.length > 0;
    const hasInputsToInvestigate =
      Array.isArray(verdict.inputsToInvestigate) &&
      verdict.inputsToInvestigate.length > 0;
    const unresolved = Array.isArray(verdict.unresolvedQuestions)
      ? verdict.unresolvedQuestions
      : [];

    return (
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-950 p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
              <ShieldAlert className="h-5 w-5 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Accountability Intelligence
              </div>
              <h3 className="mt-1 text-xl font-bold tracking-tight">
                Investigation Verdict
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">
                Evidence-based assessment and required corrective direction.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
              REVIEW
            </span>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          {(verdict.overallAssessment || summary) && (
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Overall assessment
              </div>
              <p className="text-base leading-7 text-gray-800">
                {verdict.overallAssessment || summary}
              </p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {verdict.mostConsequentialGap && (
              <VerdictMetric
                icon={Target}
                label="Most consequential gap"
                value={verdict.mostConsequentialGap}
                tone="danger"
              />
            )}
            {verdict.mostImportantRootCause && (
              <VerdictMetric
                icon={GitBranch}
                label="Primary root cause"
                value={verdict.mostImportantRootCause}
                tone="warning"
              />
            )}
            {verdict.greatestRisk && (
              <VerdictMetric
                icon={ShieldAlert}
                label="Greatest risk"
                value={verdict.greatestRisk}
                tone="default"
              />
            )}
          </div>

          {(hasInputsToPreserve || hasInputsToInvestigate) && (
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                Operating input decisions
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {hasInputsToPreserve && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                      <CheckCircle className="h-4 w-4" />
                      Preserve
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {verdict.inputsToPreserve.map((input, index) => (
                        <span
                          key={`${input}-${index}`}
                          className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800"
                        >
                          {input}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasInputsToInvestigate && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <Search className="h-4 w-4" />
                      Investigate
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {verdict.inputsToInvestigate.map((input, index) => (
                        <span
                          key={`${input}-${index}`}
                          className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900"
                        >
                          {input}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {action && typeof action === "object" && (
            <div className="overflow-hidden rounded-2xl border border-orange-200">
              <div className="flex items-center gap-3 bg-orange-600 p-4 text-white sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-orange-100">
                    Priority 01
                  </div>
                  <h4 className="mt-1 text-lg font-bold">
                    Highest-priority corrective action
                  </h4>
                </div>
              </div>

              <div className="space-y-5 p-4 sm:p-5">
                {action.behavior && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Behavior to correct
                    </div>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {action.behavior}
                    </p>
                  </div>
                )}

                {action.exactAction && (
                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-800">
                      <Target className="h-4 w-4" />
                      Required action
                    </div>
                    <p className="text-base font-semibold leading-relaxed text-gray-900">
                      {action.exactAction}
                    </p>
                  </div>
                )}

                {action.measurableTarget && (
                  <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                    <Gauge className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Measurable target
                      </div>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {action.measurableTarget}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {action.deadlineOrFrequency && (
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <CalendarCheck className="h-4 w-4" />
                        Frequency / deadline
                      </div>
                      <p className="text-sm leading-relaxed text-gray-800">
                        {action.deadlineOrFrequency}
                      </p>
                    </div>
                  )}
                  {action.relatedGoal && (
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <TrendingUp className="h-4 w-4" />
                        Related goal
                      </div>
                      <p className="text-sm leading-relaxed text-gray-800">
                        {action.relatedGoal}
                      </p>
                    </div>
                  )}
                </div>

                {action.verificationMethod && (
                  <div className="flex items-start gap-3">
                    <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Verification method
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-gray-700">
                        {action.verificationMethod}
                      </p>
                    </div>
                  </div>
                )}

                {action.reviewCondition && (
                  <div className="flex items-start gap-3 border-t border-gray-100 pt-4">
                    <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Review condition
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-gray-700">
                        {action.reviewCondition}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {unresolved.length > 0 && (
            <details className="group rounded-xl border border-gray-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold text-gray-800">
                <span className="flex items-center gap-2">
                  <CircleHelp className="h-4 w-4 text-gray-500" />
                  Unresolved questions
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {unresolved.length}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-3 border-t border-gray-100 p-4">
                {unresolved.map((question, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {formatValue(question)}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <ShieldCheck className="h-4 w-4" />
          Review Verification Gate
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Milestone Verification
        </h2>
        <p className="text-sm leading-relaxed text-gray-500">
          Verify the actual outcome. If the milestone was missed, investigate
          the causes before moving forward.
        </p>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center text-sm font-medium text-gray-500">
            Current Milestone
          </div>
          <h3 className="mb-3 text-center text-2xl font-bold text-gray-900">
            {milestone?.name || "No Milestone Found"}
          </h3>

          {milestone?.target != null && (
            <p className="mb-3 text-center font-mono text-sm text-gray-500">
              Target: {formatValue(milestone.target)}
            </p>
          )}

          {milestone?.success_criteria && (
            <p className="mx-auto mb-6 max-w-2xl text-center text-sm leading-relaxed text-gray-600">
              <span className="font-semibold">Success criteria: </span>
              {milestone.success_criteria}
            </p>
          )}

          {!hasMilestone ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Verification unavailable
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    No milestone is attached to this review. Resolve the
                    milestone selection before continuing.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="my-6 border-t border-gray-100" />
              <p className="mb-4 text-center text-sm font-semibold text-gray-800">
                Was this milestone achieved?
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={isAchieved}
                  onClick={() => selectDecision("achieved")}
                  className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-colors ${
                    isAchieved
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50/50"
                  }`}
                >
                  {isAchieved ? (
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  ) : (
                    <Circle className="h-7 w-7 text-gray-400" />
                  )}
                  <span className="text-sm font-semibold">Achieved</span>
                  <span className="text-center text-xs leading-relaxed">
                    The required outcome was reached.
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={decision === "not_achieved"}
                  onClick={() => selectDecision("not_achieved")}
                  className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-colors ${
                    decision === "not_achieved"
                      ? "border-orange-500 bg-orange-50 text-orange-800"
                      : "border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50/50"
                  }`}
                >
                  {decision === "not_achieved" ? (
                    <AlertCircle className="h-7 w-7 text-orange-600" />
                  ) : (
                    <Circle className="h-7 w-7 text-gray-400" />
                  )}
                  <span className="text-sm font-semibold">Not achieved</span>
                  <span className="text-center text-xs leading-relaxed">
                    Investigate the failure and identify what must change.
                  </span>
                </button>
              </div>
            </>
          )}
        </section>

        {isAchieved && hasMilestone && (
          <section className="rounded-xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-green-800">
                  Milestone marked as achieved
                </h3>
                <p className="text-sm leading-relaxed text-green-700">
                  You can proceed to review and evolve your operating inputs for
                  the next execution period.
                </p>
              </div>
            </div>
          </section>
        )}

        {decision === "not_achieved" && hasMilestone && (
          <section className="space-y-5 rounded-xl border border-orange-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <Search className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Mandatory Failure Investigation
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  The AI generates questions from your milestone, execution
                  records, previous reviews, and existing behavioral patterns.
                  Your explanations are compared against tracked evidence.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Investigation error
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {questions.length === 0 && !investigationCompleted && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-4 flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Step 1 — Generate investigation questions
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      Questions use the available review evidence. Missing
                      execution data should be treated as unknown, not
                      automatically as zero.
                    </p>
                  </div>
                </div>

                {!dataPayload && (
                  <p className="mb-4 text-sm text-red-700">
                    Review data payload not found. Check that Data Assembly
                    saves its result to assembledDataPayload or dataPayload.
                  </p>
                )}

                <button
                  type="button"
                  onClick={startInvestigation}
                  disabled={loadingQuestions || !dataPayload}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingQuestions ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Generating questions...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Generate Investigation Questions
                    </>
                  )}
                </button>
              </div>
            )}

            {questions.length > 0 && !investigationCompleted && (
              <div className="space-y-5">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Step 2 — Answer the investigation
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Answer every required question before analysis.
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                    {questions.filter(
                      (question) =>
                        String(answers[question.id] ?? "").trim()
                    ).length}{" "}
                    of {questions.length} answered
                  </span>
                </div>

                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-xl border border-gray-200 p-4 sm:p-5"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`investigation-${question.id}`}
                          className="block text-sm font-semibold leading-relaxed text-gray-900"
                        >
                          {question.question}
                          {question.required !== false && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </label>
                        {question.reason && (
                          <p className="mt-2 text-sm leading-relaxed text-gray-600">
                            <span className="font-medium">Why this matters: </span>
                            {question.reason}
                          </p>
                        )}
                        {question.evidence && (
                          <p className="mt-2 text-xs leading-relaxed text-gray-500">
                            <span className="font-semibold">Evidence: </span>
                            {question.evidence}
                          </p>
                        )}
                      </div>
                    </div>

                    <textarea
                      id={`investigation-${question.id}`}
                      value={answers[question.id] ?? ""}
                      onChange={(event) =>
                        updateAnswer(question.id, event.target.value)
                      }
                      rows={4}
                      required={question.required !== false}
                      placeholder="Explain what happened, what you did, and what prevented the outcome..."
                      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm leading-relaxed text-gray-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                ))}

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm leading-relaxed text-blue-800">
                    <span className="font-semibold">Be specific.</span> State
                    what happened, when it happened, what you controlled, and
                    what evidence supports your explanation. Distinguish facts
                    from assumptions.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={startInvestigation}
                    disabled={loadingQuestions || submittingAnswers}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loadingQuestions ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Regenerate Questions
                  </button>

                  <button
                    type="button"
                    onClick={submitInvestigation}
                    disabled={
                      !allQuestionsAnswered ||
                      submittingAnswers ||
                      loadingQuestions
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingAnswers ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Analyzing evidence and answers...
                      </>
                    ) : (
                      <>
                        Analyze Failure and Generate Corrective Plan
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {!allQuestionsAnswered && (
                  <p className="text-xs text-gray-500">
                    Answer all required questions to enable analysis.
                  </p>
                )}
              </div>
            )}

            {investigationCompleted && report && (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">
                        Investigation analysis completed
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                        Review the findings and corrective actions before
                        proceeding.
                      </p>
                    </div>
                  </div>
                </div>

                <InvestigationVerdict
                  verdict={report.verdict}
                  summary={report.summary}
                />

                {report.summary && (
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h4 className="mb-2 text-sm font-semibold text-gray-900">
                      Executive Summary
                    </h4>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                      {report.summary}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {renderSection(
                    "Root Causes",
                    report.rootCauses,
                    <Search className="h-4 w-4 text-orange-600" />
                  )}
                  {renderSection(
                    "Execution Reality Check",
                    report.executionRealityCheck
                  )}
                  {renderSection(
                    "Commitment and Accountability",
                    report.commitmentAccountability
                  )}
                  {renderSection("Comfort vs. Work", report.comfortVsWork)}
                  {renderSection(
                    "Strategic Alignment",
                    report.strategicAlignment
                  )}
                  {renderSection(
                    "Consequence Projection",
                    report.consequenceProjection
                  )}
                  {renderSection(
                    "Behavioral Weakness Update",
                    report.behavioralWeaknessUpdate
                  )}
                  {renderSection("Mandatory Notes", report.mandatoryNotes)}
                  {renderSection(
                    "Corrective Actions",
                    report.correctiveActions,
                    <Target className="h-4 w-4 text-green-700" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={submitInvestigation}
                  disabled={submittingAnswers}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {submittingAnswers ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Re-run Analysis
                </button>
              </div>
            )}

            {!investigationCompleted && (
              <div className="flex items-start gap-2 rounded-lg border border-orange-100 bg-orange-50 p-4 text-sm text-orange-900">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  The next review step remains locked until all required
                  investigation answers have been analyzed successfully.
                </p>
              </div>
            )}
          </section>
        )}

        {!canContinue && hasMilestone && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LockKeyhole className="h-4 w-4 shrink-0" />
            {decision === "not_achieved"
              ? "Complete the failure investigation to continue."
              : "Select Achieved or Not achieved to proceed."}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {decision === "not_achieved"
            ? "Continue to Next Step"
            : "Evolve Inputs"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
