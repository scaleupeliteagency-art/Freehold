
const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_MODEL = "openai/gpt-oss-120b";
const REQUEST_TIMEOUT_MS = 60000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchGroqAnalysis(
  systemPrompt,
  userPrompt,
  model = DEFAULT_MODEL,
  maxRetries = 1
) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured. Add it to your environment variables."
    );
  }

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let response;

    try {
      const controller = new AbortController();

      const timeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
      );

      try {
        response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model || DEFAULT_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
            max_tokens: 8000,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        const error = new Error(
          `Groq API error ${response.status}: ${
            errorText.slice(0, 500) || "No details provided."
          }`
        );

        error.status = response.status;

        if (
          (response.status === 429 || response.status >= 500) &&
          attempt < maxRetries
        ) {
          lastError = error;
          await wait(1500 * (attempt + 1));
          continue;
        }

        throw error;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (typeof content !== "string" || !content.trim()) {
        throw new Error("Groq returned empty or unexpected content.");
      }

      try {
        return JSON.parse(content);
      } catch {
        throw new Error(
          "Groq returned invalid JSON. Please try again."
        );
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        lastError = new Error(
          "The Groq API request timed out after 60 seconds."
        );
      } else {
        lastError = error;
      }

      const status = lastError?.status;

      if (
        status &&
        status !== 429 &&
        status < 500
      ) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        await wait(1500 * (attempt + 1));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error("Groq analysis failed.");
}
