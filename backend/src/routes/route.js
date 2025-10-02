import express from "express";
import { file_parse_controller } from "../controllers/file_parse_controller.js";
import { googleAuth } from "../controllers/googleauth.js";

const router = express.Router();

router.get(`/parse-files`, file_parse_controller);
router.get("/googleauth", googleAuth);

export default router;
