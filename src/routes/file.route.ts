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
    const isAllowed = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
    cb(null, isAllowed);
  }
});

router.get('/home', auth, listFiles);
router.post('/upload', auth, fileUpload.array('files', 10), uploadFiles);
router.delete('/item/:alias', auth, deleteFile);
router.get('/:alias', auth, listFiles);

export default router;
