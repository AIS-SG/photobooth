import express from 'express';
const router = express.Router({mergeParams:true});

router.get("/test", (req, res, next) => {
  res.send("hello!");
});

export default router;
