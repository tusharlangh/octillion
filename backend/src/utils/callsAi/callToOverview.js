import dotenv from "dotenv";
import { trackLLMPerformance } from "../processMetrics.js";
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

export async function callToOverview(
  messages,
  model = "llama-3.3-70b-versatile",
  temperature = 0.7,
  maxTokens = 1000,
  userId = null
) {
  const startTime = Date.now();

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const latency = Date.now() - startTime;

      trackLLMPerformance({
        userId,
        modelUsed: model,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        latency,
        temperature,
        maxTokens,
        success: false,
        errorMessage: `Groq API error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`,
      });

      throw new Error(
        `Groq API error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    const raw = data.choices[0].message.content;

    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    const totalTokens = data.usage?.total_tokens || 0;

    trackLLMPerformance({
      userId,
      modelUsed: model,
      promptTokens,
      completionTokens,
      totalTokens,
      latency,
      temperature,
      maxTokens,
      success: true,
      errorMessage: null,
    });

    return raw;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw error;
  }
}
