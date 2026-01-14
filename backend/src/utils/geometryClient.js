import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from "dotenv";

dotenv.config();

const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function invokeGeometry(path, payload, isAsync = false) {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const baseUrl = process.env.GEOMETRY_SERVICE_URL || "http://localhost:8000";

    const fetchPromise = fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (isAsync) return { status: "queued" };

    const response = await fetchPromise;
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  const functionName = process.env.GEOMETRY_LAMBDA_NAME;

  const command = new InvokeCommand({
    FunctionName: functionName,
    InvocationType: isAsync ? "Event" : "RequestResponse",
    Payload: JSON.stringify({
      path: path,
      httpMethod: "POST",
      body: JSON.stringify(payload),
    }),
  });

  const response = await lambdaClient.send(command);

  if (isAsync) return { status: "queued" };

  const payloadString = Buffer.from(response.Payload).toString();

  let result;
  try {
    result = JSON.parse(payloadString);
  } catch (parseError) {
    console.error("Failed to parse Lambda payload:", {
      error: parseError.message,
      payload: payloadString.substring(0, 1000),
      path,
      functionName,
    });
    throw new Error(`Failed to parse Lambda response: ${parseError.message}`);
  }

  if (result.statusCode && result.statusCode >= 400) {
    throw new Error(`Lambda Error ${result.statusCode}: ${result.body}`);
  }

  if (!result.body) {
    console.error("Lambda returned no body:", {
      result,
      path,
      functionName,
    });
    throw new Error("Lambda returned empty body");
  }

  try {
    return JSON.parse(result.body);
  } catch (parseError) {
    console.error("Failed to parse result.body:", {
      error: parseError.message,
      body:
        typeof result.body === "string"
          ? result.body.substring(0, 1000)
          : result.body,
      bodyType: typeof result.body,
      path,
      functionName,
    });
    throw new Error(`Failed to parse Lambda body: ${parseError.message}`);
  }
}
