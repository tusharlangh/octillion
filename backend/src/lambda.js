import ServerlessHttp from "serverless-http";
import app from "../server.js";

export const handler = async (event, context) => {
  try {
    const serverlessHandler = ServerlessHttp(app, {
      provider: "aws",
      binary: ["multipart/form-data"],
    });
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error("Lambda Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://octillion.vercel.app",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
      }),
    };
  }
};
