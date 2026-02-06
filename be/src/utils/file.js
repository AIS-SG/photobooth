import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';

const __filename = fileURLToPath(import.meta.url);
export const UPLOADED_DIR = path.resolve(path.dirname(__filename), "../../uploaded");

export const savePhotoFile = async(filename, file) => {
  try {
      const dirPath = path.resolve(UPLOADED_DIR);
      const filePath = path.join(dirPath, filename);
      
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, file.buffer);

      console.log(`✅ File saved successfully to: ${filePath}`);
      return filePath; // 성공 시 저장된 경로 반환

    } catch (error) {
      console.error('❌ Error saving file:', error);
      throw error; // 에러 발생 시 호출한 쪽으로 전파
    }
}

/**
 * 타임랩스 영상 생성: 입력 영상을 6배속으로 인코딩
 * @param {string} inputPath - 입력 파일 경로
 * @param {string} outputPath - 출력 파일 경로
 * @param {number} speed - 배속 (기본값: 6)
 * @returns {Promise<string>} 출력 파일 경로
 */
export const convertToTimelapse = async (inputPath, outputPath, speed = 6) => {
  // 출력 디렉토리 사전 생성
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`[ffmpeg] Input: ${inputPath}, Output: ${outputPath}, Speed: ${speed}x`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters([`setpts=PTS/${speed}`]) // 재생 속도를 speed배로 가속
      .output(outputPath)
      .outputOptions(['-c:v libx264', '-c:a aac', '-preset fast']) // h264 + aac로 인코딩
      .on('end', () => {
        console.log(`✅ Timelapse video created: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ Timelapse conversion error:', err);
        reject(err);
      })
      .run();
  });
}
