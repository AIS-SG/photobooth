import pkg from 'pdf-to-printer';
import path from 'path'
import fs from 'fs'
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
const { print } = pkg;
export const printImageFile = async(file, copy) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
  });
  const __filename = fileURLToPath(import.meta.url);
  const tempDir = path.resolve(path.dirname(__filename), "../../temp");
  const tempPdfPath = path.resolve(tempDir, `print_job_${Date.now()}.pdf`);
  const stream = fs.createWriteStream(tempPdfPath);
  doc.pipe(stream);
  doc.image(file.buffer, {
     fit: [doc.page.width - 100, doc.page.height - 100],
     align: 'center',
     valign: 'center',
   });
  doc.end();
  await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  try {
     console.log(`Printing ${tempPdfPath}...`);
     await print(tempPdfPath,{copies: copy});
     console.log('Print job sent successfully!');
   } catch (error) {
     console.error('Error printing file:', error);
   } finally {
     await fs.promises.unlink(tempPdfPath);
     console.log(`Cleaned up temporary file: ${tempPdfPath}`);
   }
}
