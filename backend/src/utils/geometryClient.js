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

  const result = JSON.parse(Buffer.from(response.Payload).toString());

  if (result.statusCode && result.statusCode >= 400) {
    throw new Error(`Lambda Error ${result.statusCode}: ${result.body}`);
  }

  return JSON.parse(result.body);
}
