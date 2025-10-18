import bookmarkService from '../services/bookmarkService.js';
import { sendResponse } from '../utils/response.js';

const bookmarkController = {
  // GET /api/bookmarks
  async getBookmarks(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, { status: 401, error: true, message: 'Unauthorized', data: null });
      }

      const { type, page = 1, limit = 20, sort = 'created_at' } = req.query;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20)); // Max 100 items per page

      // Validate sort parameter
      const validSorts = ['created_at', 'title', 'rating'];
      const sortBy = validSorts.includes(sort) ? sort : 'created_at';

      const result = await bookmarkService.getUserBookmarks({
        userId,
        type,
        page: pageNum,
        limit: limitNum,
        sort: sortBy
      });

      if (!result.success) {
        return sendResponse(res, { status: 500, error: true, message: 'Failed to fetch bookmarks', data: null, error: result.error.message });
      }

      return sendResponse(res, { status: 200, error: false, message: 'Bookmarks retrieved successfully', data: result.data });
    } catch (error) {
      return sendResponse(res, { status: 500, error: true, message: 'Internal server error', data: null, error: error.message });
    }
  },

  // POST /api/bookmarks
  async createBookmark(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { error: true, message: 'Unauthorized', data: null });
      }

      const { manga_id, type, notes } = req.body;

      // Validate required fields
      if (!manga_id || !type) {
        return sendResponse(res, 400, { error: true, message: 'Missing required fields', data: null });
      }

      // Validate type
      const validTypes = ['favorite', 'reading', 'completed', 'plan_to_read', 'dropped'];
      if (!validTypes.includes(type)) {
        return sendResponse(res, 400, { error: true, message: 'Invalid bookmark type', data: { validTypes } });
      }

      // Validate notes length if provided
      if (notes && notes.length > 2000) {
        return sendResponse(res, 400, { error: true, message: 'Notes too long', data: { maxLength: 2000 } });
      }

      const result = await bookmarkService.createOrUpdateBookmark({
        userId,
        mangaId: manga_id,
        type,
        notes
      });

      if (!result.success) {
        if (result.error.message.includes('not found')) {
          return sendResponse(res, 404, { error: true, message: 'Manga not found', data: null });
        }
        return sendResponse(res, 400, { error: true, message: 'Failed to create bookmark', data: null });
      }

      const statusCode = result.data.created ? 201 : 200;
      const message = result.data.created ? 'Bookmark created successfully' : 'Bookmark updated successfully';

      return sendResponse(res, statusCode, { error: false, message, data: result.data.bookmark });
    } catch (error) {
      return sendResponse(res, 500, { error: true, message: 'Internal server error', data: null });
    }
  },

  // PUT /api/bookmarks/:bookmarkId
  async updateBookmark(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { error: true, message: 'Unauthorized', data: null });
      }

      const { bookmarkId } = req.params;
      const { type, notes } = req.body;

      // Validate bookmark ID
      if (!bookmarkId) {
        return sendResponse(res, 400, { error: true, message: 'Missing bookmark ID', data: null });
      }

      // Validate type if provided
      if (type !== undefined) {
        const validTypes = ['favorite', 'reading', 'completed', 'plan_to_read', 'dropped'];
        if (!validTypes.includes(type)) {
          return sendResponse(res, 400, { error: true, message: 'Invalid bookmark type', data: { validTypes } });
        }
      }

      // Validate notes length if provided
      if (notes !== undefined && notes !== null && notes.length > 2000) {
        return sendResponse(res, 400, { error: true, message: 'Notes too long', data: { maxLength: 2000 } });
      }

      const result = await bookmarkService.updateBookmark({
        bookmarkId,
        userId,
        type,
        notes
      });

      if (!result.success) {
        if (result.error.message.includes('not found') || result.error.message.includes('access denied')) {
          return sendResponse(res, 404, { error: true, message: 'Bookmark not found', data: null });
        }
        return sendResponse(res, 400, { error: true, message: 'Failed to update bookmark', data: null });
      }

      return sendResponse(res, 200, { error: false, message: 'Bookmark updated successfully', data: result.data.bookmark });
    } catch (error) {
      return sendResponse(res, 500, { error: true, message: 'Internal server error', data: null });
    }
  },

  // DELETE /api/bookmarks/:bookmarkId
  async deleteBookmark(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { error: true, message: 'Unauthorized', data: null });
      }

      const { bookKey } = req.params;

      // Validate bookmark ID
      if (!bookKey) {
        return sendResponse(res, 400, { error: true, message: 'Missing bookmark ID', data: null });
      }

      const result = await bookmarkService.deleteBookmark({
        bookKey,
        userId
      });

      if (!result.success) {
        if (result.error.message.includes('not found') || result.error.message.includes('access denied')) {
          return sendResponse(res, 404, { error: true, message: 'Bookmark not found', data: null });
        }
        return sendResponse(res, 400, { error: true, message: 'Failed to delete bookmark', data: null });
      }

      return sendResponse(res, 200, { error: false, message: 'Bookmark deleted successfully', data: null });
    } catch (error) {
      return sendResponse(res, 500, { error: true, message: 'Internal server error', data: null });
    }
  },

  // GET /api/bookmarks/check/:mangaId
  async checkBookmarkStatus(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { error: true, message: 'Unauthorized', data: null });
      }

      const { mangaId } = req.params;

      // Validate manga ID
      if (!mangaId) {
        return sendResponse(res, 400, { error: true, message: 'Missing manga ID', data: null });
      }

      const result = await bookmarkService.checkBookmarkStatus({
        userId,
        mangaId
      });

      if (!result.success) {
        return sendResponse(res, 500, { error: true, message: 'Failed to check bookmark status', data: null });
      }

      console.log('result:', result.data.bookmark.dataValues);
      return sendResponse(res, { status: 200, error: false, message: 'Bookmark status retrieved', data: result.data });
    } catch (error) {
      return sendResponse(res, 500, { error: true, message: 'Internal server error', data: null });
    }
  },

  // GET /api/bookmarks/stats
  async getBookmarkStats(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { error: true, message: 'Unauthorized', data: null });
      }

      const result = await bookmarkService.getBookmarkStats({ userId });

      if (!result.success) {
        return sendResponse(res, { status: 500, error: true, message: 'Failed to fetch bookmark statistics', data: null});
      }

      return sendResponse(res, { status: 200, error: false, message: 'Bookmark statistics retrieved', data: result.data });
    } catch (error) {
      return sendResponse(res, { status: 500, error: true, message: 'Internal server error', data: null });
    }
  },

  // POST /api/bookmarks/bulk
  async bulkCreateBookmarks(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, { status: 401, error: true, message: 'Unauthorized', data: null});
      }

      const { bookmarks } = req.body;

      // Validate input
      if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
        return sendResponse(res, { status: 400, error: true, message: 'Invalid input', data: null});
      }

      // Validate bookmarks array length (max 100 at once)
      if (bookmarks.length > 100) {
        return sendResponse(res, { status: 400, error: true, message: 'Too many bookmarks', data: null});
      }

      // Validate each bookmark structure
      for (let i = 0; i < bookmarks.length; i++) {
        const bookmark = bookmarks[i];
        if (!bookmark.mangaId || !bookmark.type) {
          return sendResponse(res, { status: 400, error: true, message: 'Invalid bookmark data', data: null});
        }
      }

      const result = await bookmarkService.bulkCreateBookmarks({
        userId,
        bookmarks: bookmarks.map(b => ({
          mangaId: b.mangaId,
          type: b.type,
          notes: b.notes
        }))
      });

      if (!result.success) {
        return sendResponse(res, { status: 400, error: true, message: 'Failed to create bookmarks', data: null });
      }

      return sendResponse(res, { status: 201, error: false, message: 'Bulk bookmark operation completed', data: result.data });
    } catch (error) {
      return sendResponse(res, { status: 500, error: true, message: 'Internal server error', data: null });
    }
  },

  // GET /api/bookmarks/export
  async exportBookmarks(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, { status: 401, error: true, message: 'Unauthorized', data: null });
      }

      const { format = 'json' } = req.query;

      // Validate format
      if (!['json'].includes(format)) {
        return sendResponse(res, { status: 400, error: true, message: 'Invalid format', data: null });
      }

      const result = await bookmarkService.exportBookmarks({ userId, format });

      if (!result.success) {
        return sendResponse(res, { status: 500, error: true, message: 'Failed to export bookmarks', data: null });
      }

      // Set appropriate headers for download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="bookmarks-${new Date().toISOString().split('T')[0]}.json"`);

      return sendResponse(res, { status: 200, error: false, message: 'Bookmarks exported successfully', data: result.data });
    } catch (error) {
      return sendResponse(res, { status: 500, error: true, message: 'Internal server error', data: null });
    }
  }
};

export default bookmarkController;