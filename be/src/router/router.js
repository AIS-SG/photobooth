import express from 'express';
import { StatusCodes } from 'http-status-codes';
import photoRouter from "../photo/router/photo.router.js"
const router = express.Router({mergeParams:true});
router.use("/photo", photoRouter);
export default router;
