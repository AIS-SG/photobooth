import express from 'express';
import multer, { memoryStorage } from 'multer'
import { handleSubmit, handleDownload } from '../controller/photo.controller.js';
const router = express.Router({mergeParams:true});
const upload = multer({storage: memoryStorage()})

// accept photo + optional timelapse video
router.post(
  "/submit",
  upload.fields([{ name: "photo", maxCount: 1 }, { name: "timelapse", maxCount: 1 }]),
  handleSubmit
);
router.get("/download", handleDownload);

export default router;
