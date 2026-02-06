import path from 'path';
import { savePhotoFile, convertToTimelapse, UPLOADED_DIR } from "../../utils/file.js";
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

  // optional timelapse (with 6x speed encoding)
  if (data.timelapse) {
    console.log('[submit] timelapse originalname:', data.timelapse.originalname, 'mimetype:', data.timelapse.mimetype);

    // 원본 영상 임시 저장
    const rawVideoFileName = `tmp_${uuidv4()}.webm`;
    const rawVideoPath = await savePhotoFile(rawVideoFileName, data.timelapse);

    // 타임랩스로 변환 (6배속)
    const timelapseFileName = `${uuidv4()}.mp4`;
    const timelapseFilePath = path.join(UPLOADED_DIR, timelapseFileName);

    try {
      await convertToTimelapse(rawVideoPath, timelapseFilePath, 6); // 6배속 인코딩
      filesToZip.push({ path: timelapseFilePath, name: timelapseFileName });

      // 임시 파일 삭제
      try {
        const { unlink } = await import('fs/promises');
        await unlink(rawVideoPath);
      } catch (e) {
        console.warn('Failed to delete temp raw video file:', e);
      }
    } catch (err) {
      console.error('Timelapse conversion failed, using original file:', err);
      // 변환 실패 시 원본 파일을 그대로 사용
      filesToZip.push({ path: rawVideoPath, name: timelapseFileName });
    }
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
