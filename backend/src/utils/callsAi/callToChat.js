import dotenv from "dotenv";
import { trackLLMPerformance } from "../processMetrics.js";
dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

export async function callToChat(
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
          Authorization: `Bearer ${groqApiKey}`,
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

      if (response.status === 429 && model === "llama-3.3-70b-versatile") {
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
          errorMessage: `Groq API rate limit: ${response.status} - Falling back to openai-4o-mini`,
        });

        const fallbackStartTime = Date.now();
        const openaiResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages,
              temperature,
              max_tokens: maxTokens,
            }),
          }
        );

        if (!openaiResponse.ok) {
          const openaiErrorData = await openaiResponse.json().catch(() => ({}));
          const fallbackLatency = Date.now() - fallbackStartTime;

          trackLLMPerformance({
            userId,
            modelUsed: "gpt-4o-mini",
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            latency: fallbackLatency,
            temperature,
            maxTokens,
            success: false,
            errorMessage: `OpenAI API error: ${openaiResponse.status} - ${
              openaiErrorData.error?.message || openaiResponse.statusText
            }`,
          });

          throw new Error(
            `OpenAI API error: ${openaiResponse.status} - ${
              openaiErrorData.error?.message || openaiResponse.statusText
            }`
          );
        }

        const openaiData = await openaiResponse.json();
        const fallbackLatency = Date.now() - fallbackStartTime;
        const raw = openaiData.choices[0].message.content;

        const promptTokens = openaiData.usage?.prompt_tokens || 0;
        const completionTokens = openaiData.usage?.completion_tokens || 0;
        const totalTokens = openaiData.usage?.total_tokens || 0;

        trackLLMPerformance({
          userId,
          modelUsed: "gpt-4o-mini",
          promptTokens,
          completionTokens,
          totalTokens,
          latency: fallbackLatency,
          temperature,
          maxTokens,
          success: true,
          errorMessage: null,
        });

        return raw;
      }

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
