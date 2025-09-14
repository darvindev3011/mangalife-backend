const express = require('express');
const router = express.Router();

const booksController = require('../controllers/booksController');
const bookDetailsController = require('../controllers/bookDetailsController');
const chapterListController = require('../controllers/chapterListController');
const chapterDetailsController = require('../controllers/chapterDetailsController');
const genresController = require('../controllers/genresController');
const { login, register, profile, updateProfile, uploadAvatar } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

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
router.post("/upload-avatar", upload.single("avatar"), uploadAvatar);

module.exports = router;
