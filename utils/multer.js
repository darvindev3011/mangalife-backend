import multer from 'multer';
import { extname } from 'path';
import fs from 'fs';

// create stirage options for multer
export const storageOptions = (dir = '', isMultiFilds) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir = null;
      // this functionality for multiple file with different fields
      if (isMultiFilds) {
        uploadDir = `${dir}/${file.fieldname.replace('_', '')}`;
      } else {
        uploadDir = dir;
      }
      const fullPath = 'uploads/' + uploadDir;
      // Ensure directory exists
      fs.mkdirSync(fullPath, { recursive: true });
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const fileExt = extname(file.originalname);
      const fileName = `${Date.now()}${fileExt}`;
      cb(null, fileName);
    },
  });
};

// include multer to API using useMulter
export const useMulter = (dir, isMultiFilds = false) => {
  return multer({ 
    storage: storageOptions(dir, isMultiFilds),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });
};
