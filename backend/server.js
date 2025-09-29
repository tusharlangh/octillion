import express from "express";
import cors from "cors";
import routes from "./src/routes/route.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 5002;

const app = express();
app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    app.use("/", routes);
    app.listen(port, () => {
      console.log("Backend server is running at http://localhost:5002");
    });
  } catch (error) {
    console.log(`${error} has occured.`);
  }
}

await startServer();
