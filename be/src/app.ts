import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_, res) => res.send("ok"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`BE running on :${port}`));
