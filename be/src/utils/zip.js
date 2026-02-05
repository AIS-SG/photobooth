import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

export const createZip = async (files, zipFileName) => {
  // files: [{ path: absolutePath, name: nameInZip }]
  const __filename = fileURLToPath(import.meta.url);
  const uploadedDir = path.resolve(path.dirname(__filename), "../../uploaded");
  await fs.promises.mkdir(uploadedDir, { recursive: true });

  const zipPath = path.resolve(uploadedDir, zipFileName);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      resolve(zipPath);
    });
    output.on('error', (err) => reject(err));

    archive.pipe(output);

    for (const f of files) {
      // if a path is absolute, use that file; otherwise consider relative
      archive.file(f.path, { name: f.name });
    }

    archive.finalize().catch(reject);
  });
};
