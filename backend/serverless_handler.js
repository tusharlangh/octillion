import serverless from "serverless-http";
import app from "./server.js";
import { processFiles } from "./src/services/processFiles.js";

export const handler = async (event, context) => {
  if (event.id && event.keys && event.userId) {
    console.log("Processing files...", event);
    return await processFiles(event.id, event.keys, event.userId);
  }

  return serverless(app)(event, context);
};
