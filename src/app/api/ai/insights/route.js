import { NextResponse } from "next/server";
import { fetchGroqAnalysis } from "@/lib/ai/groq";

export async function POST(request) {
  try {
    const body = await request.json();
    const { dataPayload } = body;

    const systemPrompt = `You are the Quarterly Insights engine for Working Ledger.
Your job is to answer: "What patterns is my system revealing over the whole quarter?"
Focus on: Execution Patterns, Input Patterns, Bottlenecks, Input Evolution, and Milestone Patterns.
Distinguish between observed facts and AI interpretation/hypothesis.
Return a structured JSON object exactly matching this schema:
{
  "insights": [
    {
      "category": "Execution Pattern" | "Input Pattern" | "Bottleneck" | "Input Evolution" | "Milestone Pattern",
      "observed_fact": "string",
      "ai_hypothesis": "string"
    }
  ]
}`;

    const userPrompt = `Analyze the following quarterly system data:\n${JSON.stringify(dataPayload, null, 2)}`;

    const analysis = await fetchGroqAnalysis(systemPrompt, userPrompt);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
