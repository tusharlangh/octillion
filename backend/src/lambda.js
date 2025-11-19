import ServerlessHttp from "serverless-http";
import app from "../server.js";

export const handler = async (event, context) => {
  try {
    console.log("Event:", JSON.stringify(event, null, 2));
    const serverlessHandler = ServerlessHttp(app, {
      provider: "aws",
    });
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error("Lambda Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://octillion.vercel.app",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
        stack: error.stack,
      }),
    };
  }
};
