import express from 'express';
import {
  createProductionLog,
  getProductionLogsByActivityAndFarm,
  getProductionLogsByFarm,
  getProductionLogsByID,
  handleGetImageProductionLog
} from '../controllers/productionLogs.controller';
import { auth, checkRole } from '../middleware/auth.midleware';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const generateRandomNumber = () => {
  return Math.floor(Math.random() * 1000000000); // Số ngẫu nhiên 9 chữ số
};
// Tạo cấu hình lưu trữ cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads'); // Điều chỉnh lại đường dẫn
    ensureUploadsDirExists(); // Kiểm tra và tạo thư mục nếu chưa có
    cb(null, uploadPath); // Chỉ định thư mục lưu file
  },
  filename: (req, file, cb) => {
    const randomNumber = generateRandomNumber(); // Tạo số ngẫu nhiên
    const extname = path.extname(file.originalname); // Lấy phần mở rộng của file
    const newFileName = `images-${randomNumber}${extname}`; // Tạo tên file mới
    cb(null, newFileName); // Trả về tên file mới
  }
});

// Cấu hình multer sử dụng storage đã tạo
const upload = multer({
  storage: storage, // Dùng storage đã định nghĩa
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn kích thước file (5MB)
});
export const ensureUploadsDirExists = () => {
  const uploadPath = path.join(__dirname, '../../uploads'); // Điều chỉnh đường dẫn đến đúng thư mục
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true }); // Tạo thư mục nếu chưa có
  }
};

const router = express.Router();

router.get('/images/:filename', handleGetImageProductionLog);
// Public routes
router.post('/', auth, createProductionLog);
router.get('/', getProductionLogsByActivityAndFarm);
router.get('/:id', getProductionLogsByID);

//
router.get('/farm/:farm_id', auth, getProductionLogsByFarm);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
