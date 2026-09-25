import { NextResponse } from "next/server";
import { fetchGroqAnalysis } from "@/lib/ai/groq";

export async function POST(request) {
  try {
    const body = await request.json();
    const { reviewType, dataPayload } = body;

    const systemPrompt = `You are the investigative engine for Working Ledger.
Your job is to analyze the user's actual operating data and identify meaningful patterns, bottlenecks, and potential operating-system improvements.
Distinguish between observed facts and possible interpretations. Do not present correlation as causation.
Return a structured JSON object exactly matching this schema:
{
  "patterns_detected": [
    { "observation": "string", "hypothesis": "string" }
  ],
  "potential_issues": [
    { "observation": "string", "hypothesis": "string" }
  ],
  "outcome_relationships": [
    { "observation": "string", "hypothesis": "string" }
  ],
  "summary": "string (a brutal, honest synthesis of the state of the system)"
}`;

    const userPrompt = `Perform a ${reviewType} review on the following system data:\n${JSON.stringify(dataPayload, null, 2)}`;

    const analysis = await fetchGroqAnalysis(systemPrompt, userPrompt);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI Investigation Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
