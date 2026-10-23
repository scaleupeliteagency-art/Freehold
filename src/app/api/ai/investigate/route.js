import { NextResponse } from "next/server";
import { fetchGroqAnalysis } from "@/lib/ai/groq";

/**
 * POST /api/ai/investigate
 *
 * Accepts a review payload and returns a structured investigation report.
 * The report covers execution reality, accountability, behavioral patterns,
 * strategic alignment, root causes, consequence projection, and verdict.
 *
 * Body:
 * {
 *   reviewType: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY",
 *   dataPayload: {
 *     system: { id, name, why, description, start_date, deadline },
 *     goalHierarchy: {
 *       northStar: { name, target_value, current_value, unit, deadline },
 *       yearPlan: { year_number, status },
 *       quarter: { objective, start_date, end_date, status },
 *       rock: { name, description, success_criteria, status },
 *       milestone: { name, target, success_criteria, status, deadline }
 *     },
 *     inputs: [{
 *       id, name, target, frequency, unit, weight,
 *       executionEntries: [{ date, actual_value, completed }],
 *       aggregates: { totalActual, targetForPeriod, completionPct, periodDays, entryCount }
 *     }],
 *     reviewPeriod: { start: "YYYY-MM-DD", end: "YYYY-MM-DD", daysInPeriod: number },
 *     previousReviews: [{ period_start, period_end, summary, investigation }],
 *     behavioralWeaknessRegister: [{ pattern, status, evidence_entries }]
 *   }
 * }
 */

const INVESTIGATION_SCHEMA = `{
  "executionRealityCheck": [
    {
      "inputName": "string",
      "targetQty": "number or null",
      "targetFrequency": "string",
      "unit": "string",
      "actualCompleted": "number or null",
      "completionPct": "number or null",
      "shortfallOrExcess": "number or null",
      "dataAvailability": "AVAILABLE | PARTIAL | UNKNOWN",
      "evidenceSummary": "string",
      "milestoneImpact": "string"
    }
  ],
  "commitmentAccountability": {
    "fulfilled": ["string"],
    "partiallyFulfilled": ["string"],
    "missed": ["string"],
    "missedWithinControl": ["string"],
    "alternativeActivities": "string or null",
    "comfortOverWork": "boolean or null",
    "unrealisticCommitments": "boolean or null",
    "failedCorrectiveAction": "boolean or null",
    "evidenceSummary": "string",
    "followUpQuestions": ["string"]
  },
  "comfortVsWork": {
    "applicable": "boolean",
    "cases": [
      {
        "committed": "string",
        "didInstead": "string or null",
        "opportunityLost": "string",
        "milestoneRelevance": "string",
        "quarterlyRisk": "string",
        "annualRisk": "string",
        "fiveYearRisk": "string"
      }
    ],
    "closingNote": "string"
  },
  "strategicAlignment": [
    {
      "inputName": "string",
      "indicatorType": "Leading | Outcome | Maintenance | Unknown",
      "relationToObjective": "string",
      "targetClarity": "Clear | Ambiguous | Undefined",
      "overlapsWithOtherInput": "boolean",
      "timeDisplacementRisk": "string or null",
      "measureable": "boolean",
      "recommendation": "Retain | Investigate | Increase | Decrease | Replace | Remove"
    }
  ],
  "rootCauses": [
    {
      "finding": "string",
      "evidence": "string",
      "confidence": "Low | Medium | High",
      "consequence": "string",
      "category": "Behavioral | Strategic | Operational | Environmental",
      "additionalInfoNeeded": "string or null"
    }
  ],
  "consequenceProjection": {
    "inputLevel": { "status": "On track | At risk | Off track | Unknown", "detail": "string" },
    "milestoneLevel": { "status": "On track | At risk | Off track | Unknown", "detail": "string" },
    "quarterlyLevel": { "status": "On track | At risk | Off track | Unknown", "detail": "string" },
    "annualLevel": { "status": "On track | At risk | Off track | Unknown", "detail": "string" },
    "fiveYearLevel": { "status": "On track | At risk | Off track | Unknown", "detail": "string" },
    "recoveryRate": "string or null"
  },
  "behavioralWeaknessUpdate": [
    {
      "pattern": "string",
      "evidenceFromThisPeriod": "string",
      "triggeringSituation": "string or null",
      "proposedStatus": "Suspected | Evidence emerging | Confirmed recurring pattern | Improving | Resolved | Reopened",
      "proposedIntervention": "string",
      "verificationCriteria": "string",
      "isNew": "boolean"
    }
  ],
  "verdict": {
    "overallAssessment": "string",
    "mostConsequentialGap": "string",
    "mostImportantRootCause": "string",
    "greatestRisk": "string",
    "inputsToPreserve": ["string"],
    "inputsToInvestigate": ["string"],
    "highestPriorityAction": {
      "behavior": "string",
      "exactAction": "string",
      "measurableTarget": "string",
      "deadlineOrFrequency": "string",
      "relatedGoal": "string",
      "verificationMethod": "string",
      "reviewCondition": "string"
    },
    "unresolvedQuestions": ["string"]
  },
  "mandatoryNotes": ["string"],
  "correctiveActions": [
    {
      "behavior": "string",
      "exactAction": "string",
      "measurableTarget": "string",
      "deadlineOrFrequency": "string",
      "relatedGoalOrInput": "string",
      "verificationMethod": "string",
      "reviewCondition": "string"
    }
  ],
  "summary": "string"
}`;

function buildSystemPrompt() {
  return `You are an evidence-driven accountability engine for a long-term goal execution system.

Your role is to produce a rigorous, structured investigation report based ONLY on the actual data provided.

CRITICAL RULES:
1. Never fabricate execution records, numbers, deadlines, financial figures, or probabilities.
2. If actual execution data is missing or unavailable, explicitly mark the result as UNKNOWN. Do NOT infer completion from intention.
3. Do not automatically label a user as underperforming without sufficient evidence.
4. Distinguish clearly between: confirmed facts, reasonable inferences, and uncertain outcomes.
5. Do not confuse missing data with zero execution.
6. A behavioral pattern must not be labeled "Confirmed recurring pattern" based on a single review period.
7. Do not silently modify strategic goals or operating inputs. Only report findings and propose changes.
8. The tone must be direct, demanding, rational, and professional. Challenge decisions without shaming.
9. Completion percentage = (actual completed / target) × 100. Handle zero targets and missing values safely.

Use the formula for recovery rate only when you have: remaining target, elapsed progress, and remaining working days.

Return ONLY a valid JSON object exactly matching this schema — no markdown, no explanation outside the JSON:
${INVESTIGATION_SCHEMA}`;
}


function buildUserPrompt(reviewType, dataPayload, investigationAnswers = []) {
  return `Perform a ${reviewType} investigation on the following system data.

REVIEW PERIOD: ${dataPayload.reviewPeriod?.start || "unknown"} to ${dataPayload.reviewPeriod?.end || "unknown"} (${dataPayload.reviewPeriod?.daysInPeriod || "unknown"} days)

SYSTEM:
${JSON.stringify(dataPayload.system, null, 2)}

GOAL HIERARCHY:
${JSON.stringify(dataPayload.goalHierarchy, null, 2)}

OPERATING INPUTS WITH ACTUAL EXECUTION DATA:
${JSON.stringify(dataPayload.inputs, null, 2)}

PREVIOUS REVIEWS (for pattern detection):
${JSON.stringify(dataPayload.previousReviews || [], null, 2)}

BEHAVIORAL WEAKNESS REGISTER (existing patterns):
${JSON.stringify(dataPayload.behavioralWeaknessRegister || [], null, 2)}

Instructions:
- For each input, use the executionEntries and aggregates fields to determine actual vs target.
- If executionEntries is empty or aggregates.totalActual is null, mark dataAvailability as UNKNOWN.
- Do not treat a missing entry as zero execution — state explicitly that data is unavailable.
- Trace every significant finding up through the goal hierarchy (milestone → quarterly → annual → five-year).
- In behavioralWeaknessUpdate, flag isNew:true for patterns not in the existing register.
- In comfortVsWork, only populate cases when there is actual evidence of avoidance (not speculation).
- correctiveActions must be 1–3 specific, measurable items max.

${
  investigationAnswers.length > 0
    ? `

USER'S MILESTONE INVESTIGATION ANSWERS:
${JSON.stringify(investigationAnswers, null, 2)}

MANDATORY ANSWER-ANALYSIS INSTRUCTIONS:
- Explicitly consider each answer alongside the execution records.
- Distinguish user-reported explanations from independently verified facts.
- Identify contradictions between answers and tracked data, if any.
- Use answers to refine root causes, but do not treat an answer alone as proof of a recurring behavioral pattern.
- Explain which causes are supported, which remain uncertain, and what evidence is missing.
- Make corrective actions address the best-supported causes.
`
    : ""
}`;
}

/**
 * Validate that the response matches the expected schema structure.
 * Returns { valid: boolean, issues: string[] }
 */
function validateInvestigationResponse(obj) {
  const issues = [];

  if (typeof obj !== "object" || obj === null) {
    return { valid: false, issues: ["Response is not an object"] };
  }

  const required = [
    "executionRealityCheck",
    "commitmentAccountability",
    "comfortVsWork",
    "strategicAlignment",
    "rootCauses",
    "consequenceProjection",
    "behavioralWeaknessUpdate",
    "verdict",
    "mandatoryNotes",
    "correctiveActions",
    "summary",
  ];

  for (const field of required) {
    if (!(field in obj)) {
      issues.push(`Missing required field: ${field}`);
    }
  }

  if (!Array.isArray(obj.executionRealityCheck)) {
    issues.push("executionRealityCheck must be an array");
  }

  if (typeof obj.summary !== "string") {
    issues.push("summary must be a string");
  }

  return { valid: issues.length === 0, issues };
}

const QUESTION_SCHEMA = `{
  "questions": [
    {
      "id": "q1",
      "question": "string",
      "reason": "string",
      "evidence": "string",
      "answerType": "text",
      "required": true
    }
  ]
}`;

function buildQuestionsPrompt(reviewType, dataPayload) {
  const systemPrompt = `You are an evidence-driven accountability investigator.

Generate 4 to 7 specific questions to investigate why the user's milestone was not achieved.

RULES:
- Use the actual milestone, operating-input targets, execution entries, aggregates, prior reviews, and behavioral weakness register.
- Every question must investigate a real uncertainty or a possible explanation grounded in the supplied data.
- Ask about missing execution, avoidance, competing activities, unrealistic commitments, operational obstacles, strategy, and failed corrective actions ONLY when relevant.
- Distinguish missing tracking data from confirmed non-execution.
- Do not assume psychological motives or accuse the user of avoidance without evidence.
- Avoid generic questions that could be asked of anyone.
- Questions should be concise, direct, answerable, and non-duplicative.
- Include at least one question about the most consequential gap in the execution evidence.
- Include a question about what specifically prevented the milestone from being reached.
- Return ONLY valid JSON matching this schema:
${QUESTION_SCHEMA}`;

  const userPrompt = `Generate the investigation questions for this ${reviewType} review.

CURRENT MILESTONE AND GOAL HIERARCHY:
${JSON.stringify(dataPayload.goalHierarchy || {}, null, 2)}

SYSTEM:
${JSON.stringify(dataPayload.system || {}, null, 2)}

ACTUAL OPERATING-INPUT EXECUTION DATA:
${JSON.stringify(dataPayload.inputs || [], null, 2)}

REVIEW PERIOD:
${JSON.stringify(dataPayload.reviewPeriod || {}, null, 2)}

PREVIOUS REVIEWS:
${JSON.stringify(dataPayload.previousReviews || [], null, 2)}

EXISTING BEHAVIORAL WEAKNESS REGISTER:
${JSON.stringify(dataPayload.behavioralWeaknessRegister || [], null, 2)}

Generate questions that investigate this particular situation. Cite the specific data or uncertainty motivating each question in its evidence field.`;

  return { systemPrompt, userPrompt };
}

function compactInvestigationPayload(dataPayload, aggressive = false) {
  const inputs = (dataPayload.inputs || []).map((input) => ({
    id: input.id,
    name: input.name,
    target: input.target,
    frequency: input.frequency,
    unit: input.unit,
    weight: input.weight,
    // Aggregates preserve the period totals even when older entries are omitted.
    aggregates: input.aggregates
      ? {
          totalActual: input.aggregates.totalActual,
          targetForPeriod: input.aggregates.targetForPeriod,
          completionPct: input.aggregates.completionPct,
          periodDays: input.aggregates.periodDays,
          entryCount: input.aggregates.entryCount,
        }
      : null,
    executionEntries: (input.executionEntries || [])
      .slice(-(aggressive ? 8 : 20))
      .map((entry) => ({
        date: entry.date,
        actual_value: entry.actual_value,
        completed: entry.completed,
      })),
  }));

  const previousReviews = (dataPayload.previousReviews || [])
    .slice(-(aggressive ? 1 : 2))
    .map((review) => ({
      period_start: review.period_start,
      period_end: review.period_end,
      summary:
        typeof review.summary === "string"
          ? review.summary.slice(0, aggressive ? 500 : 1000)
          : review.summary ?? null,
      // Retain concise conclusions from prior investigations, if available.
      investigation: review.investigation
        ? {
            summary: review.investigation.summary,
            verdict: review.investigation.verdict
              ? {
                  overallAssessment:
                    review.investigation.verdict.overallAssessment,
                  mostConsequentialGap:
                    review.investigation.verdict.mostConsequentialGap,
                  mostImportantRootCause:
                    review.investigation.verdict.mostImportantRootCause,
                }
              : undefined,
          }
        : undefined,
    }));

  const behavioralWeaknessRegister = (
    dataPayload.behavioralWeaknessRegister || []
  )
    .slice(-(aggressive ? 3 : 5))
    .map((item) => ({
      pattern: item.pattern,
      status: item.status,
      evidence_entries: (item.evidence_entries || [])
        .slice(-(aggressive ? 1 : 3)),
    }));

  return {
    system: dataPayload.system,
    goalHierarchy: dataPayload.goalHierarchy,
    reviewPeriod: dataPayload.reviewPeriod,
    inputs,
    previousReviews,
    behavioralWeaknessRegister,
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { reviewType, dataPayload, action, investigationAnswers } = body;

  // Validate required input fields
  if (!reviewType) {
    return NextResponse.json({ error: "reviewType is required." }, { status: 400 });
  }

  if (!dataPayload) {
    return NextResponse.json({ error: "dataPayload is required." }, { status: 400 });
  }

  if (!dataPayload.system) {
    return NextResponse.json(
      { error: "dataPayload.system is required. Complete Data Assembly before running AI Investigation." },
      { status: 400 }
    );
  }

  if (!dataPayload.inputs || dataPayload.inputs.length === 0) {
    return NextResponse.json(
      { error: "No active operating inputs found. Add inputs before running the investigation." },
      { status: 400 }
    );
  }

  const isGeneratingQuestions = action === "generate_questions";

  async function runInvestigation(aggressive = false) {
    const compactPayload = compactInvestigationPayload(
      dataPayload,
      aggressive
    );

    const prompts = isGeneratingQuestions
      ? buildQuestionsPrompt(reviewType, compactPayload)
      : {
          systemPrompt: buildSystemPrompt(),
          userPrompt: buildUserPrompt(
            reviewType,
            compactPayload,
            action === "analyze_answers" &&
              Array.isArray(investigationAnswers)
              ? investigationAnswers
              : []
          ),
        };

    return fetchGroqAnalysis(
      prompts.systemPrompt,
      prompts.userPrompt,
      undefined,
      0
    );
  }

  let analysis;

  try {
    try {
      analysis = await runInvestigation(false);
    } catch (err) {
      // Retry only an oversized prompt, using a smaller evidence payload.
      if (!err.message?.includes("Groq API error 413")) {
        throw err;
      }

      console.warn(
        "[AI Investigation] Request exceeded Groq limits; retrying with compact context.",
        { reviewType, action }
      );

      analysis = await runInvestigation(true);
    }
  } catch (err) {
    console.error("[AI Investigation] Groq request failed:", {
      message: err.message,
      reviewType,
      action,
      systemId: dataPayload.system?.id,
      inputCount: dataPayload.inputs?.length,
    });

    const isPayloadTooLarge = err.message?.includes("Groq API error 413");
    const isRateLimited =
      err.message?.includes("rate limit") ||
      err.message?.includes("429");

    return NextResponse.json(
      {
        error: isPayloadTooLarge
          ? "The investigation context is still too large for Groq after reducing it. Reduce the number of operating inputs or historical records and retry."
          : isRateLimited
            ? "Groq is rate-limiting requests. Wait briefly before retrying."
            : err.message || "AI investigation failed.",
        retryable: isRateLimited || !isPayloadTooLarge,
      },
      {
        status: isPayloadTooLarge ? 413 : isRateLimited ? 429 : 500,
      }
    );
  }

  // If the response came back as a raw string (JSON parse failed in fetchGroqAnalysis),
  // try to parse it once more here.
  if (typeof analysis === "string") {
    try {
      analysis = JSON.parse(analysis);
    } catch {
      return NextResponse.json(
        {
          error: "AI returned a non-JSON response. Please retry the investigation.",
          retryable: true,
        },
        { status: 502 }
      );
    }
  }

  if (isGeneratingQuestions) {
    const questions = analysis?.questions;

    if (
      !Array.isArray(questions) ||
      questions.length < 4 ||
      questions.length > 7 ||
      questions.some(
        (q) =>
          !q ||
          typeof q.id !== "string" ||
          typeof q.question !== "string" ||
          !q.question.trim()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "AI did not return 4–7 valid investigation questions. Please retry.",
          retryable: true,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions });
  }

  // Validate schema
  const { valid, issues } = validateInvestigationResponse(analysis);
  if (!valid) {
    console.error(
      "[AI Investigation] Schema validation failed:",
      issues,
      "Response keys:",
      Object.keys(analysis)
    );
    return NextResponse.json(
      {
        error: `AI response did not match the expected schema: ${issues.slice(0, 3).join("; ")}. Please retry.`,
        retryable: true,
      },
      { status: 502 }
    );
  }

  return NextResponse.json(analysis);
}