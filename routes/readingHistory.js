import express from 'express';
import readingHistoryController from '../controllers/readingHistoryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All reading history routes require authentication
router.use(authMiddleware);

// GET /api/history - Get user's reading history with optional filtering and pagination
// Query params: page, limit, manga_id, days
router.get('/', readingHistoryController.getReadingHistory);

// GET /api/history/stats - Get reading statistics for the user
// Query params: days (default: 30)
router.get('/stats', readingHistoryController.getReadingStats);

// GET /api/history/continue-reading - Get list of manga to continue reading
// Query params: limit (default: 15)
router.get('/continue-reading', readingHistoryController.getContinueReading);

// GET /api/history/sessions/active - Get active reading sessions
router.get('/sessions/active', readingHistoryController.getActiveSessions);

// GET /api/history/manga/:mangaId - Get complete reading history for specific manga
router.get('/manga/:mangaId/:chapterNumber', readingHistoryController.getMangaHistory);

// GET /api/history/progress/:mangaId - Get current reading progress for specific manga
router.get('/progress/:mangaId', readingHistoryController.getMangaProgress);

// POST /api/history - Record or update reading progress
// Body: { 
//   manga_id: string, 
//   chapter_number: number, 
//   chapter_title?: string,
//   page_number: number,
//   total_pages?: number,
//   reading_time_seconds?: number,
//   device_type?: string
// }
router.post('/', readingHistoryController.recordReadingProgress);

// POST /api/history/session/start - Start a reading session
// Body: { manga_id: string, chapter_number: number }
router.post('/session/start', readingHistoryController.startReadingSession);

// PUT /api/history/session/:sessionId/end - End a reading session
// Body: { pages_read?: number }
router.put('/session/:sessionId/end', readingHistoryController.endReadingSession);

// PUT /api/history/mark-completed/:mangaId - Mark manga as completed
router.put('/mark-completed/:mangaId', readingHistoryController.markMangaCompleted);

// DELETE /api/history/:historyId - Delete a reading history entry
router.delete('/:historyId', readingHistoryController.deleteHistoryEntry);

export default router;