import path from 'path';
import { savePhotoFile } from "../../utils/file.js";
import { printImageFile } from "../../utils/printer.js"
import { v4 as uuidv4 } from 'uuid';
import QRcode from 'qrcode';
import { reportPhotoUploadDate, verifyPhotoExpires } from "../repository/photo.repository.js";
import { submitResponseDto, verifyResponseDto } from "../dto/response/photo.response.dto.js";
import { createZip } from "../../utils/zip.js";

export const submit = async (data) => {
  // print (still using original photo)
  await printImageFile(data.photo, data.number);

  // save photo
  const photoMime = (data.photo.mimetype || '').split(';')[0];
  const photoExt = (photoMime.split('/').at(-1) || 'png').toLowerCase();
  const photoFileName = `${uuidv4()}.${photoExt}`;
  const photoPath = await savePhotoFile(photoFileName, data.photo);
  const filesToZip = [{ path: photoPath, name: photoFileName }];

  // optional timelapse
  if (data.timelapse) {
    // log original file info for debugging
    console.log('[submit] timelapse originalname:', data.timelapse.originalname, 'mimetype:', data.timelapse.mimetype);

    // Force timelapse file to be saved with .mp4 extension.
    // NOTE: This only changes the filename/extension. If the uploaded bytes are not MP4,
    // the file content will remain the original format (e.g., WebM). To convert formats, add ffmpeg conversion.
    let vidExt = 'mp4';

    const videoFileName = `${uuidv4()}.${vidExt}`;
    const videoPath = await savePhotoFile(videoFileName, data.timelapse);
    filesToZip.push({ path: videoPath, name: videoFileName });
  }

  // create zip archive
  const zipFileName = `${uuidv4()}.zip`;
  const zipPath = await createZip(filesToZip, zipFileName);

  await reportPhotoUploadDate(zipFileName);
  const downloadUrl = `${process.env.PRODUCTION_DOMAIN}/photo/download?name=${zipFileName}`;
  const qrCodeDataUrl = await QRcode.toDataURL(downloadUrl);
  return submitResponseDto({ downloadUrl, qrCodeDataUrl });
}

export const verify = async (data) => {
  const isAvailable = await verifyPhotoExpires(data);
  if (!isAvailable) throw new Error("만료된 다운로드 링크 입니다.");
  return verifyResponseDto(null);
}
