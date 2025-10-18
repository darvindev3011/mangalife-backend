import express from 'express';
import bookmarkController from '../controllers/bookmarkController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All bookmark routes require authentication
router.use(authMiddleware);

// GET /api/bookmarks - Get user's bookmarks with optional filtering and pagination
// Query params: type, page, limit, sort
router.get('/', bookmarkController.getBookmarks);

// GET /api/bookmarks/stats - Get bookmark statistics for the user
router.get('/stats', bookmarkController.getBookmarkStats);

// GET /api/bookmarks/export - Export user's bookmarks
// Query params: format (default: json)
router.get('/export', bookmarkController.exportBookmarks);

// GET /api/bookmarks/check/:mangaId - Check if manga is bookmarked
router.get('/check/:mangaId', bookmarkController.checkBookmarkStatus);

// POST /api/bookmarks - Create or update a bookmark
// Body: { manga_id: string, type: string, notes?: string }
router.post('/', bookmarkController.createBookmark);

// POST /api/bookmarks/bulk - Bulk create bookmarks
// Body: { bookmarks: [{ mangaId: string, type: string, notes?: string }] }
router.post('/bulk', bookmarkController.bulkCreateBookmarks);

// PUT /api/bookmarks/:bookmarkId - Update an existing bookmark
// Body: { type?: string, notes?: string }
router.put('/:bookmarkId', bookmarkController.updateBookmark);

// DELETE /api/bookmarks/:bookKey - Delete a bookmark
router.delete('/:bookKey', bookmarkController.deleteBookmark);

export default router;