import express from "express";
import cors from "cors";
import routes from "./src/routes/route.js";
import dotenv from "dotenv";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const port = process.env.PORT || 5002;

const app = express();

// Configure CORS to allow credentials (cookies)
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

async function startServer() {
  try {
    app.use("/", routes);

    app.use((req, res) => {
      res.status(404).json({
        error: {
          code: "ROUTE_NOT_FOUND",
          message: `Cannot ${req.method} ${req.path}`,
        },
      });
    });

    app.use(errorHandler);

    app.listen(port, "0.0.0.0", () => {
      console.log("Backend server is running");
    });
  } catch (error) {
    console.log(`${error} has occured.`);
  }
}

await startServer();
