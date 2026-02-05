import { downloadRequestDto, submitRequestDto } from "../dto/request/photo.request.dto.js";
import { submit, verify } from "../service/photo.service.js";
import {StatusCodes} from "http-status-codes"
import fs from 'fs';
import path from 'path';

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
              timelapse:{
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
  try {
    const files = req.files || {};
    const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo || req.file;
    const timelapseFile = Array.isArray(files.timelapse) ? files.timelapse[0] : files.timelapse || null;
    const qrCode = await submit(submitRequestDto(req.body, photoFile, timelapseFile));
    res.status(StatusCodes.OK).success(qrCode);
  } catch (err) {
    next(err);
  }
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
  try {
    await verify(downloadRequestDto(req.query));
    const fileName = path.basename(req.query.name);
    const filePath = path.resolve(`./uploaded/${fileName}`);
    const ext = path.extname(filePath).toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === '.zip') contentType = 'application/zip';
    else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') contentType = `image/${ext.replace('.', '')}`;
    else if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.mov') contentType = 'video/quicktime';
    else if (ext === '.avi') contentType = 'video/x-msvideo';
    else if (ext === '.mkv') contentType = 'video/x-matroska';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
}
