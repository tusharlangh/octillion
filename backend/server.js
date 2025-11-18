import express from "express";
import cors from "cors";
import routes from "./src/routes/route.js";
import dotenv from "dotenv";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

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

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const port = process.env.PORT || 5002;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
