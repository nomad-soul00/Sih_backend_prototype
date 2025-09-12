import express from 'express';
import multer from 'multer';
import path from 'path';

import { UploadData } from '../controllers/Process.controllers.js';

const dataRouter = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


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

// Multer middleware
const upload = multer({
  storage,
  fileFilter
});


dataRouter.post('/hmpi/upload', upload.single('uploadedFile'), UploadData);

dataRouter.post('/mhei/upload', upload.single('uploadedFile'), UploadData);


export default dataRouter;
