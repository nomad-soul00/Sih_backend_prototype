import path from "path";
import parse from "../config/ExcelParser.js";

export const UploadData = (req, res) => {
  try {
    const file = req.file;
  //   console.log("Received file:", req.file);
  // console.log("Received body:", req.body);

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

    // ✅ Parse from buffer instead of file path
    const excelData = parse(file.buffer); // <-- changed from file.path

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        userName: req.body.userName,
        year: req.body.year,
        filename: file.originalname,
        parsData: excelData
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
};
