import { downloadRequestDto, submitRequestDto } from "../dto/request/photo.request.dto.js";
import { submit, verify } from "../service/photo.service.js";
import {StatusCodes} from "http-status-codes"
import fs from 'fs';

export const handleSubmit = async(req,res,next) => {
  /*
    #swagger.summary = "사진 업로드 및 인쇄"
    #swagger.description = "사진을 받아 다운로드 QR코드를 생성하고 인쇄 작업을 진행합니다."
    #swagger.requestBody = {
      required: true,
      content:{
        "multipart/form-data":{
          schema:{
            type:"object",
            properties:{
              photo:{
                type:"string",
                format:"binary",
              },
              number: {
                type:"number",
                example: 2,
              }
            }
          }
        }
      }
    }
  */
  const qrCode = await submit(submitRequestDto(req.body, req.file));
  res.status(StatusCodes.OK).success(qrCode);
}
export const handleDownload = async (req,res,next) => {
  /*
    #swagger.summary = "사진 다운로드"
    #swagger.description = "촬영한 사진을 다운로드 합니다."
    #swagger.parameters["name"] = {
      in:"query",
      required:true,
    }
  */
  await verify(downloadRequestDto(req.query));
  const imagePath = `./uploaded/${req.query.name}`;
  res.setHeader('Content-Type', `image/${(req.query.name).split(".").at(-1)}`);
  fs.createReadStream(imagePath).pipe(res);
}
