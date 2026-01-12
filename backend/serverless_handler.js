import serverless from "serverless-http";
import app from "./server.js";
import { processFiles } from "./src/services/processFiles.js";

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  
  if (event.id && event.keys && event.userId) {
    console.log("Processing files...", event);
    return await processFiles(event.id, event.keys, event.userId);
  }

  // Handle API Gateway events
  return await serverlessHandler(event, context);
};
