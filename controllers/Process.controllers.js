import path from "path";
import parse from "../config/ExcelParser.js";
import fs from 'fs';



export const UploadData = (req, res) => {
  try {
    const file = req.file;

    // Check if file is present
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    // Validate file extension and MIME type
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    const isXLSX =
      ext === '.xlsx' &&
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!isXLSX) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Please upload a .xlsx file."
      });
    }

    const excelData = parse(file.path); 

    // const parsedData = parse(file.path);

    // let excelData = [];
    // if (parsedData && Array.isArray(parsedData.Sheet1)) {
    //   excelData = parsedData.Sheet1.length > 20 ? parsedData.Sheet1.slice(0, 20) : parsedData.Sheet1;
    // } else {
    //   excelData = [];
    // }


    // console.log(newXldata[12])




    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        userName: req.body.userName,
        year: req.body.year,
        filename: file.filename,
        parsData: excelData
      },

    });

    //deleting the file
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
};
