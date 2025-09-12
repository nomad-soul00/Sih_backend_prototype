import express from 'express';
import multer from 'multer';
import path from 'path';

import { UploadData } from '../controllers/Process.controllers.js';

const dataRouter = express.Router();

// ✅ Use memory storage instead of disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isXLSX =
    ext === '.xlsx' &&
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (isXLSX) {
    cb(null, true);
  } else {
    cb(new Error('Only .xlsx files are allowed'), false);
  }
};

// ✅ Multer with memoryStorage
const upload = multer({
  storage,
  fileFilter,
});

// ✅ These now use in-memory uploaded file
dataRouter.post('/hmpi/upload', upload.single('uploadedFile'), UploadData);
dataRouter.post('/mhei/upload', upload.single('uploadedFile'), UploadData);

export default dataRouter;
