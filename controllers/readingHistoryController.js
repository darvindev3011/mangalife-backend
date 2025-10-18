import readingHistoryService from '../services/readingHistoryService.js';
import { sendResponse } from '../utils/response.js';

const readingHistoryController = {
  // GET /api/history
  async getReadingHistory(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const { page = 1, limit = 50, manga_id, days } = req.query;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50)); // Max 100 items per page
      const daysNum = days ? Math.max(1, parseInt(days)) : null;

      const result = await readingHistoryService.getUserReadingHistory({
        userId,
        page: pageNum,
        mangaId: manga_id || null,
        limit: limitNum,
        days: daysNum || null
      });
console.log('result:', result);
      if (!result.success) {
        return sendResponse(res, {status: 500, success: false, message: 'Failed to fetch reading history', data: null, error: result.error.message});
      }

      return sendResponse(res, {status: 200, success: true, message: 'Reading history retrieved successfully', data: result.data});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  },

  // POST /api/history
  async recordReadingProgress(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const { 
        manga_id, 
        chapter_number, 
        chapter_title, 
        page_number, 
        total_pages, 
        reading_time_seconds, 
        device_type 
      } = req.body;

      // Validate required fields
      if (!manga_id || !chapter_number || !page_number) {
        return sendResponse(res, {status: 400, success: false, message: 'Missing required fields', data: null, error: 'manga_id, chapter_number, and page_number are required'});
      }

      if (total_pages && total_pages < page_number) {
        return sendResponse(res, {status: 400, success: false, message: 'Invalid page numbers', data: null, error: 'page_number cannot exceed total_pages'});
      }

      if (reading_time_seconds && reading_time_seconds < 0) {
        return sendResponse(res, {status: 400, success: false, message: 'Invalid reading time', data: null, error: 'reading_time_seconds must be non-negative'});
      }

      // Validate device type if provided
      if (device_type && !['mobile', 'tablet', 'desktop', 'unknown'].includes(device_type)) {
        return sendResponse(res, {status: 400, success: false, message: 'Invalid device type', data: null, error: 'device_type must be one of: mobile, tablet, desktop, unknown'});
      }

      // Get client information
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await readingHistoryService.recordReadingProgress({
        userId,
        mangaId: manga_id,
        chapterNumber: chapter_number,
        chapterTitle: chapter_title,
        pageNumber: parseInt(page_number),
        totalPages: total_pages ? parseInt(total_pages) : null,
        readingTimeSeconds: reading_time_seconds ? parseInt(reading_time_seconds) : 0,
        deviceType: device_type,
        userAgent,
        ipAddress
      });

      if (!result.success) {
        if (result.error.message.includes('not found')) {
          return sendResponse(res, {status: 404, success: false, message: 'Manga not found', data: null, error: result.error.message});
        }
        return sendResponse(res, {status: 400, success: false, message: 'Failed to record reading progress', data: null, error: result.error.message});
      }

      const statusCode = result.data.created ? 201 : 200;
      const message = result.data.created ? 'Reading progress recorded' : 'Reading progress updated';

      return sendResponse(res, {status: statusCode, success: true, message, data: result.data});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  },

  // GET /api/history/manga/:mangaId
  async getMangaHistory(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const { mangaId, chapterNumber } = req.params;

      if (!mangaId) {
        return sendResponse(res, {status: 400, success: false, message: 'Missing manga ID', data: null, error: 'Manga ID is required'});
      }

      if (!chapterNumber) {
        return sendResponse(res, {status: 400, success: false, message: 'Missing Chapter', data: null, error: 'Chapter number is required'});
      }

      const result = await readingHistoryService.getMangaReadingHistory({
        userId,
        mangaId,
        chapterNumber
      });

      if (!result.success) {
        if (result.error.message.includes('not found')) {
          return sendResponse(res, {status: 404, success: false, message: 'Manga not found', data: null, error: result.error.message});
        }
        return sendResponse(res, {status: 500, success: false, message: 'Failed to fetch manga history', data: null, error: result.error.message});
      }

      return sendResponse(res, {status: 200, success: true, message: 'Manga reading history retrieved successfully', data: result.data});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  },

  // GET /api/history/progress/:mangaId
  async getMangaProgress(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const { mangaId, chapterNumber } = req.params;

      if (!mangaId) {
        return sendResponse(res, {status: 400, success: false, message: 'Missing manga ID', data: null, error: 'Manga ID is required'});
      }

      const result = await readingHistoryService.getMangaProgress({
        userId,
        mangaId
      });

      if (!result.success) {
        return sendResponse(res, {status: 500, success: false, message: 'Failed to fetch reading progress', data: null, error: result.error.message});
      }

      return sendResponse(res, {status: 200, success: true, message: 'Reading progress retrieved successfully', data: result.data});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  },

  // GET /api/history/stats
  async getReadingStats(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const { days = 30 } = req.query;
      const daysNum = Math.max(1, Math.min(365, parseInt(days) || 30)); // Between 1 and 365 days

      const result = await readingHistoryService.getReadingStats({
        userId,
        days: daysNum
      });

      if (!result.success) {
        return sendResponse(res, {status: 500, success: false, message: 'Failed to fetch reading statistics', data: null, error: result.error.message});
      }

      return sendResponse(res, {status: 200, success: true, message: 'Reading statistics retrieved successfully', data: result.data});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  },

  // GET /api/history/continue-reading
  async getContinueReading(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const { limit = 15 } = req.query;
      const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 15)); // Between 1 and 50

      const result = await readingHistoryService.getContinueReading({
        userId,
        limit: limitNum
      });

      if (!result.success) {
        return sendResponse(res, {status: 500, success: false, message: 'Failed to fetch continue reading list', data: null, error: result.error.message});
      }

      return sendResponse(res, {status: 200, success: true, message: 'Continue reading list retrieved successfully', data: result.data});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  },

  // PUT /api/history/mark-completed/:mangaId
  async markMangaCompleted(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const { mangaId } = req.params;

      if (!mangaId) {
        return sendResponse(res, {status: 400, success: false, message: 'Missing manga ID', data: null, error: 'Manga ID is required'});
      }

      const result = await readingHistoryService.markMangaCompleted({
        userId,
        mangaId
      });

      if (!result.success) {
        if (result.error.message.includes('not found')) {
          return sendResponse(res, {status: 404, success: false, message: 'Manga not found', data: null, error: result.error.message});
        }
        return sendResponse(res, {status: 400, success: false, message: 'Failed to mark manga as completed', data: null, error: result.error.message});
      }

      return sendResponse(res, {status: 200, success: true, message: 'Manga marked as completed successfully', data: result.data});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  },

  // DELETE /api/history/:historyId
  async deleteHistoryEntry(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const { historyId } = req.params;

      if (!historyId) {
        return sendResponse(res, {status: 400, success: false, message: 'Missing history ID', data: null, error: 'History ID is required'});
      }

      const result = await readingHistoryService.deleteHistoryEntry({
        userId,
        historyId
      });

      if (!result.success) {
        if (result.error.message.includes('not found') || result.error.message.includes('access denied')) {
          return sendResponse(res, {status: 404, success: false, message: 'Reading history entry not found', data: null, error: result.error.message});
        }
        return sendResponse(res, {status: 400, success: false, message: 'Failed to delete history entry', data: null, error: result.error.message});
      }

      return sendResponse(res, {status: 200, success: true, message: 'Reading history entry deleted successfully', data: null});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  },

  // POST /api/history/session/start
  async startReadingSession(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const { manga_id, chapter_number } = req.body;

      if (!manga_id || !chapter_number) {
        return sendResponse(res, {status: 400, success: false, message: 'Missing required fields', data: null, error: 'manga_id and chapter_number are required'});
      }

      // Get client information
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await readingHistoryService.startReadingSession({
        userId,
        mangaId: manga_id,
        chapterNumber: chapter_number,
        userAgent,
        ipAddress
      });

      if (!result.success) {
        if (result.error.message.includes('not found')) {
          return sendResponse(res, {status: 404, success: false, message: 'Reading history not found', data: null, error: result.error.message});
        }
        return sendResponse(res, {status: 400, success: false, message: 'Failed to start reading session', data: null, error: result.error.message});
      }

      const statusCode = result.data.created ? 201 : 200;
      return sendResponse(res, {status: statusCode, success: true, message: result.data.message, data: { session: result.data.session }});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  },

  // PUT /api/history/session/:sessionId/end
  async endReadingSession(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const { sessionId } = req.params;
      const { pages_read } = req.body;

      if (!sessionId) {
        return sendResponse(res, {status: 400, success: false, message: 'Missing session ID', data: null, error: 'Session ID is required'});
      }

      // Validate pages_read if provided
      if (pages_read !== undefined && pages_read < 0) {
        return sendResponse(res, {status: 400, success: false, message: 'Invalid pages read', data: null, error: 'pages_read must be non-negative'});
      }

      const result = await readingHistoryService.endReadingSession({
        userId,
        sessionId,
        pagesRead: pages_read
      });

      if (!result.success) {
        if (result.error.message.includes('not found') || result.error.message.includes('already ended')) {
          return sendResponse(res, {status: 404, success: false, message: 'Active reading session not found', data: null, error: result.error.message});
        }
        return sendResponse(res, {status: 400, success: false, message: 'Failed to end reading session', data: null, error: result.error.message});
      }

      return sendResponse(res, {status: 200, success: true, message: result.data.message, data: { session: result.data.session }});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  },

  // GET /api/history/sessions/active
  async getActiveSessions(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, {status: 401, success: false, message: 'Unauthorized', data: null, error: 'User not authenticated'});
      }

      const result = await readingHistoryService.getActiveSessions({ userId });

      if (!result.success) {
        return sendResponse(res, {status: 500, success: false, message: 'Failed to fetch active sessions', data: null, error: result.error.message});
      }

      return sendResponse(res, {status: 200, success: true, message: 'Active sessions retrieved successfully', data: result.data});
    } catch (error) {
      return sendResponse(res, {status: 500, success: false, message: 'Internal server error', data: null, error: error.message});
    }
  }
};

export default readingHistoryController;