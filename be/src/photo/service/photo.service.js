import { savePhotoFile } from "../../utils/file.js";
import { printImageFile } from "../../utils/printer.js"
import { v4 as uuidv4 } from 'uuid';
import QRcode from 'qrcode';
import { reportPhotoUploadDate, verifyPhotoExpires } from "../repository/photo.repository.js";
import { submitResponseDto, verifyResponseDto } from "../dto/response/photo.response.dto.js";

export const submit = async(data) => {
  await printImageFile(data.photo, data.number);
  const fileName = "".concat(uuidv4(), ".", data.photo.mimetype.split("/").at(-1));
  await savePhotoFile(fileName, data.photo);
  reportPhotoUploadDate(fileName);
  const downloadUrl = "".concat(process.env.PRODUCTION_DOMAIN, "/photo/download?name=", fileName);
  const qrCodeDataUrl = await QRcode.toDataURL(downloadUrl);
  return submitResponseDto({ downloadUrl, qrCodeDataUrl });
}
export const verify = async (data) => {
  const isAvailable = verifyPhotoExpires(data);
  if (!isAvailable) throw new Error("만료된 다운로드 링크 입니다.");
  return verifyResponseDto(null);
}
