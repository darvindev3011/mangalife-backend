import multer, { StorageEngine } from 'multer';
import path from 'path';

const storage: StorageEngine = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (_req, file, cb) {
    // Use original filename with a timestamp to avoid collisions
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

export default upload;
