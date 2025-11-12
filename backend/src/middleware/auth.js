import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UnauthorizedError } from "./errorHandler.js";

dotenv.config();

export async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("No authorization header");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Malformed token");
    }

    const payload = jwt.verify(token, process.env.SUPABASE_JWT_KEY);

    if (!payload.sub) {
      throw new UnauthorizedError("Invalid token payload");
    }

    req.user = payload.sub;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token expired"));
    }

    next(error);
  }
}
