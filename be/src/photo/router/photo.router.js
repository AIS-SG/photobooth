import express from 'express';
import multer, { memoryStorage } from 'multer'
import { handleSubmit, handleDownload } from '../controller/photo.controller.js';
const router = express.Router({mergeParams:true});
const upload = multer({storage: memoryStorage()})

router.post("/submit",upload.single("photo"), handleSubmit);
router.get("/download", handleDownload);

export default router;
