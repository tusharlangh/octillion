import express from "express";
import { file_parse_controller } from "../controllers/file_parse_controller.js";
import { save_files_controller } from "../controllers/save_files_controller.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post(`/save-files`, upload.array("files", 10), save_files_controller);
router.get(`/parse-files`, file_parse_controller);

export default router;
