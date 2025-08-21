import dotenv from "dotenv";
import { setupSwagger } from "./config/swagger.js";
import router from "./router/router.js";
import {
  setupCommonError,
  setupExpress,
} from "./config/express.js";

dotenv.config();

const app = setupExpress();
const port = process.env.PORT;


setupSwagger(app);
setupCommonError(app);
app.use(router); // 라우터 설정
app.listen(port, () => {
  console.log(`서버 열림 - 포트 : ${port}`);
});
