import express from "express";
import { file_parse_controller } from "../controllers/file_parse_controller.js";
import { save_files_controller } from "../controllers/save_files_controller.js";
import upload, { handleMulterError } from "../middleware/multer.js";
import { auth } from "../middleware/auth.js";
import { get_files_controller } from "../controllers/get_files_controller.js";
import { get_view_files_controller } from "../controllers/get_view_files_controller.js";
import { get_pfp_controller } from "../controllers/get_pfp_controller.js";
import { get_chat_controller } from "../controllers/get_chat_controller.js";

const router = express.Router();

router.get(`/get-files`, auth, get_files_controller);
router.post(
  `/save-files`,
  upload.array("files", 10),
  handleMulterError,
  auth,
  save_files_controller
);
router.get(`/parse-files`, auth, file_parse_controller);
router.get(`/get-view-files`, auth, get_view_files_controller);
router.get("/get-pfp", auth, get_pfp_controller);
router.get("/get-chats", auth, get_chat_controller);

export default router;
