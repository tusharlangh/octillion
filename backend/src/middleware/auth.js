import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Malformed token" });
    }

    const payload = jwt.verify(token, process.env.SUPABASE_JWT_KEY);
    const userId = payload.sub;

    req.user = userId;
    return next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(403).json({ error: "Invalid token" });
  }
}
