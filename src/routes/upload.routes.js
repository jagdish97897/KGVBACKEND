import { Router } from "express";
import multer from "multer";
import { uploadToS3 } from "../utils/upload.js";

const upload = multer({
    storage: multer.memoryStorage() // Use memory storage to avoid storing the file on disk
});

const router = Router();

router.route("/upload").post(upload.array('files', 5), uploadToS3);

export default router;