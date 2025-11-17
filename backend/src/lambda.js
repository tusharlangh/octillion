import ServerlessHttp from "serverless-http";
import app from "../server.js";

export const handler = ServerlessHttp(app);
