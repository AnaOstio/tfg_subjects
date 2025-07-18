import multer from 'multer';

export const uploadMemory = multer({
    storage: multer.memoryStorage(),
    dest: 'tmp/',
    limits: { fileSize: 5 * 1024 * 1024 }, // límite 5 MB 
});
