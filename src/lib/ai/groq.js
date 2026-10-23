/**
 * Groq AI client for server-side API routes.
 *
 * IMPORTANT: process.env.GROQ_API_KEY must be set in the deployment
 * environment (e.g. Vercel environment variables). It is NOT available
 * from .env.local in production unless configured in the deployment.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const REQUEST_TIMEOUT_MS = 60000; // 60 seconds

/**
 * Call the Groq Chat Completions API.
 *
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {string} [model]
 * @param {number} [maxRetries=1]
 * @returns {Promise<object|string>} Parsed JSON object or raw string
 */
export async function fetchGroqAnalysis(
  systemPrompt,
  userPrompt,
  model = DEFAULT_MODEL,
  maxRetries = 1
) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY environment variable is not configured. " +
        "Add it to your deployment environment variables " +
        "(e.g. the Vercel dashboard), not only to .env.local."
    );
  }

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let timeoutId;

    try {
      const controller = new AbortController();

      timeoutId = setTimeout(() => {
        controller.abort();
      }, REQUEST_TIMEOUT_MS);

      let response;

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

      // Handle HTTP error responses.
      if (!response.ok) {
        const errText = await response.text().catch(() => "(no body)");

        if (response.status === 401) {
          throw new Error(
            "Groq API authentication failed (401). " +
              "Verify that GROQ_API_KEY is correctly set in your environment."
          );
        }

        if (response.status === 429) {
          lastError = new Error(
            `Groq API rate limit hit (429): ${errText.slice(0, 300)}`
          );

          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, 2000 * (attempt + 1))
            );
            continue;
          }

          throw lastError;
        }

        if (response.status >= 500) {
          lastError = new Error(
            `Groq API server error (${response.status}): ${errText.slice(0, 300)}`
          );

          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, 2000 * (attempt + 1))
            );
            continue;
          }

          throw lastError;
        }

        if (response.status === 413) {
          throw new Error(
            `Groq API error 413: The request exceeds the model's token limit. ${errText.slice(0, 250)}`
          );
        }

        // Client errors such as 400 or 404 are not normally retryable.
        throw new Error(
          `Groq API error ${response.status}: ${errText.slice(0, 300)}`
        );
      }

      const data = await response.json();

      if (
        !data.choices ||
        !data.choices[0] ||
        !data.choices[0].message
      ) {
        throw new Error(
          "Groq API returned an unexpected response structure."
        );
      }

      const content = data.choices[0].message.content;

      if (!content || typeof content !== "string") {
        throw new Error("Groq API returned empty content.");
      }

      try {
        return JSON.parse(content);
      } catch {
        // Preserve the original behavior: return raw content if JSON parsing fails.
        return content;
      }
    } catch (err) {
      if (err?.name === "AbortError") {
        lastError = new Error(
          `AI request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds. ` +
            "The investigation may be retried."
        );

        if (attempt < maxRetries) {
          continue;
        }

        throw lastError;
      }

      // Authentication errors should not be retried.
      if (err?.message?.includes("authentication failed")) {
        throw err;
      }

      // Do not retry other client-side HTTP errors, such as model_not_found.
      if (
        err?.message?.startsWith("Groq API error 4") &&
        !err?.message?.includes("429")
      ) {
        throw err;
      }

      lastError = err;

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }

      throw err;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  throw lastError || new Error("Groq API request failed.");
}