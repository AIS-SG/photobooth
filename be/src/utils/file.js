import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
export const savePhotoFile = async(filename, file) => {
  try {
      const __filename = fileURLToPath(import.meta.url);
      const directory = path.resolve(path.dirname(__filename), "../../uploaded");
      const dirPath = path.resolve(directory);
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
