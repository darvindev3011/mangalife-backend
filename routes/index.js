import express from 'express';
import booksController from '../controllers/booksController.js';
import bookDetailsController from '../controllers/bookDetailsController.js';
import chapterListController from '../controllers/chapterListController.js';
import chapterDetailsController from '../controllers/chapterDetailsController.js';
import genresController from '../controllers/genresController.js';


const router = express.Router();

// Directly map endpoints to controllers
router.get('/books', booksController.getBooks); // GET /api/books
router.get('/bookSearch', booksController.searchBooks);
router.get('/book/:bookKey', bookDetailsController.getBookDetails); // GET /api/book/:bookKey
router.get('/book/:bookKey/chapters', chapterListController.getChapterList); // GET /api/book/:bookKey/chapters
router.get('/book/:bookKey/chapters/:chapterNo', chapterDetailsController.getChapterDetails); // GET /api/book/:bookKey/chapters/:chapterNo
router.get('/genres', genresController.getGenres);


export default router;
