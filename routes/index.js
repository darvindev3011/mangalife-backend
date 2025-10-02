import express from 'express';
import booksController from '../controllers/booksController.js';
import bookDetailsController from '../controllers/bookDetailsController.js';
import chapterListController from '../controllers/chapterListController.js';
import chapterDetailsController from '../controllers/chapterDetailsController.js';
import genresController from '../controllers/genresController.js';
import { login, register, profile, updateProfile, uploadAvatar } from '../controllers/authController.js';
import commentsRouter from './comments.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from "../utils/multer.js";

const router = express.Router();

// Directly map endpoints to controllers
router.get('/books', booksController.getBooks); // GET /api/books
router.get('/bookSearch', booksController.searchBooks);
router.get('/book/:bookKey', bookDetailsController.getBookDetails); // GET /api/book/:bookKey
router.get('/book/:bookKey/chapters', chapterListController.getChapterList); // GET /api/book/:bookKey/chapters
router.get('/book/:bookKey/chapters/:chapterNo', chapterDetailsController.getChapterDetails); // GET /api/book/:bookKey/chapters/:chapterNo
router.get('/genres', genresController.getGenres);

// Auth-related routes
router.post("/login", login);
router.post("/register", register);
router.get("/profile", authMiddleware, profile);
router.put("/profile", authMiddleware, updateProfile);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), uploadAvatar);


export default router;

// Comments API
router.use('/comments', commentsRouter);
