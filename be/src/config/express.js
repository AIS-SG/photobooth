import express from "express";
import cors from "cors";
import { commonResponse } from "../utils/response.js";

export const setupExpress = () => {
  const app = express();
  // 허용 origin 목록: 환경변수 PRODUCTION_DOMAIN(ngrok) 및 개발용 로컬 주소들
  const allowedOrigins = [
    (process.env.PRODUCTION_DOMAIN || "").replace(/\/$/, ""),
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8081",
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Origin이 없으면(예: curl) 허용
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use(express.static("public")); // 정적 파일 접근
  app.use(express.json()); // request의 본문을 json으로 해석할 수 있도록 함 (JSON 형태의 요청 body를 파싱하기 위함)
  app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석
  app.use(commonResponse); // 공통 응답을 사용할 수 있는 헬퍼 함수 등록

  return app;
};
export const setupCommonError = (app) => {
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.statusCode || 500).error({
      errorCode: err.errorCode || "unknown",
      reason: err.reason || err.message || null,
      data: err.data || null,
    });
  });
};
 