import multer from 'multer';

// Sử dụng bộ nhớ tạm thay vì ghi file ra ổ đĩa
const storage = multer.memoryStorage();

export const upload = multer({ storage });
