import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const printImageFile = async(file, copy) => {
  // 파일과 버퍼 유효성 검사
  if (!file || !file.buffer || !file.mimetype.startsWith('image/')) {
    throw new Error('Invalid file type or missing file buffer.');
  }

  const __filename = fileURLToPath(import.meta.url);
  const tempDir = path.resolve(path.dirname(__filename), "../../temp");
  const tempPngPath = path.resolve(tempDir, `print_job_${Date.now()}.png`);

  // temp 디렉토리가 없으면 생성
  if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
  }

  // PNG 파일을 임시 디렉터리에 저장
  try {
    await fs.promises.writeFile(tempPngPath, file.buffer);
    console.log(`Temporary file saved at: ${tempPngPath}`);
  } catch (writeFileError) {
    throw new Error('Failed to save the image file to a temporary directory.', { cause: writeFileError });
  }

  try {
     console.log(`Checking for available printers...`);
     const { stdout: printerStatus } = await execPromise('lpstat -p');
     console.log('Available printers:', printerStatus);

    //  if (!printerStatus || !printerStatus.includes('Canon_SELPHY_CP1500')) {
    //    throw new Error('Canon_SELPHY_CP1500 not found. Please check your printer connection.');
    //  }

    //  console.log(`Printing ${tempPngPath}...`);
     
    //  // 터미널에서 작동한 명령어를 그대로 사용
    //  await execPromise(`lp -d Canon_SELPHY_CP1500 -o media=4x6in -n ${copy} "${tempPngPath}"`);

     console.log('Print job sent successfully!');
   } catch (error) {
     console.error('Error printing file:', error);
     throw new Error('Printing failed. Please check your printer setup.', { cause: error });
   } finally {
     try {
       await fs.promises.unlink(tempPngPath);
       console.log(`Cleaned up temporary file: ${tempPngPath}`);
     } catch (cleanupError) {
       console.error('Failed to clean up temporary file:', cleanupError);
     }
   }
 }
