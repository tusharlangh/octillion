import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

export async function callToChat(
  messages,
  model = "gpt-4o-mini",
  temperature = 0.7,
  maxTokens = 1000
) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;

    return raw;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}
