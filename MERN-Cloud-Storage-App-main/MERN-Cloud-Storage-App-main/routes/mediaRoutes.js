import { Router } from "express";
import dotenv from "dotenv";
import multer from 'multer';
import { requireSignIn } from '../middlewares/authMiddleware.js';
import { deleteMediaController, downloadMediaController, editMediaController, getAllMediaController, getMediaController, getUserMediaController, loadMoreFilesController, searchProductController, uploadMediaController } from "../controller/mediaController.js";

const router = Router();
dotenv.config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder for uploaded files
        cb(null, '../uploads/'); // Ensure this directory exists or create it if necessary
    },
    filename: (req, file, cb) => {
        // Set the filename to be unique by appending a timestamp
        cb(null, `${Date.now()}.${file.originalname.split('.').pop()}`);
    }
});

// Create the multer instance with the defined storage and limits
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // Limit file size to 100 MB
});

// Endpoint for uploading media
router.post('/upload', requireSignIn, upload.single('file'), uploadMediaController); // Use the multer middleware here

// Other routes remain unchanged
router.get('/get/:filename', getMediaController); // Adjust how you fetch if necessary
router.get('/get-all', getAllMediaController);
router.get('/get-user-media', requireSignIn, getUserMediaController);
router.delete('/delete/:id', requireSignIn, deleteMediaController);
router.put('/edit/:id', requireSignIn, editMediaController);
router.get('/search/:keyword', searchProductController);
router.get('/more-files/:page', loadMoreFilesController);
router.get('/download/:filename', downloadMediaController); // Update this controller to fetch from Cloudinary

export default router;
