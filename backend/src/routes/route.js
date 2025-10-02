import express from "express";
import { file_parse_controller } from "../controllers/file_parse_controller.js";

const router = express.Router();

router.get(`/parse-files`, file_parse_controller);

export default router;
