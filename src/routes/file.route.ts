import express from 'express';
import multer from 'multer';
import { deleteFile, listFiles, uploadFiles } from '~/controllers/file.controller';
import { auth } from '~/middleware/auth.midleware';

const router = express.Router();

const storage = multer.memoryStorage();
const fileUpload = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const isAllowed = file.mimetype.startsWith('image/') || allowedMimeTypes.includes(file.mimetype);
    cb(null, isAllowed);
  }
});

router.get('/home', auth, listFiles);
router.post('/upload', auth, fileUpload.array('files', 10), uploadFiles);
router.delete('/item/:alias', auth, deleteFile);
router.get('/:alias', auth, listFiles);

export default router;
