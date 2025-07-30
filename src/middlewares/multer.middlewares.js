import multer from 'multer';

const storage = multer.memoryStorage();
  
export const upload = multer({ 
    storage,
    limits: {
      fileSize: 16 * 1024 * 1024, // 16 MB
    },
});
