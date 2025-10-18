import { Bookmark, Book, BookDetail, User } from '../models/index.js';

const bookmarkService = {
  // Get paginated bookmarks for a user
  async getUserBookmarks({ userId, type, page = 1, limit = 20, sort = 'created_at' }) {
    try {
      const offset = (page - 1) * limit;
      const where = { user_id: userId };
      
      if (type && Bookmark.getValidTypes().includes(type)) {
        where.bookmark_type = type;
      }

      // Determine sort order
      let order = [['created_at', 'DESC']];
      switch (sort) {
        case 'title':
          order = [[{ model: Book, as: 'manga' }, { model: BookDetail, as: 'bookDetail' }, 'title', 'ASC']];
          break;
        case 'rating':
          order = [[{ model: Book, as: 'manga' }, { model: BookDetail, as: 'bookDetail' }, 'rating', 'DESC']];
          break;
        case 'created_at':
        default:
          order = [['created_at', 'DESC']];
          break;
      }

      const result = await Bookmark.findAndCountAll({
        where,
        include: [
          {
            model: Book,
            as: 'manga',
            include: [
              {
                model: BookDetail,
                as: 'bookDetail',
                attributes: ['title', 'author', 'bannerUrl', 'bookKey']
              }
            ]
          }
        ],
        offset: Number(offset),
        limit: Number(limit),
        order,
        distinct: true // Prevents counting duplicates from joins
      });

      const totalPages = Math.ceil(result.count / limit);

      return {
        success: true,
        data: {
          bookmarks: result.rows,
          pagination: {
            currentPage: Number(page),
            totalPages,
            totalItems: result.count,
            itemsPerPage: Number(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Create or update a bookmark
  async createOrUpdateBookmark({ userId, mangaId, type, notes }) {
    try {
      // Validate bookmark type
      if (!Bookmark.getValidTypes().includes(type)) {
        return {
          success: false,
          error: new Error(`Invalid bookmark type. Valid types: ${Bookmark.getValidTypes().join(', ')}`)
        };
      }

      // Check if manga exists
      const manga = await Book.findOne({ where: { bookKey: mangaId } });
      if (!manga) {
        return {
          success: false,
          error: new Error('Manga not found')
        };
      }

      const checkBookmark = await Bookmark.findOne({ where: { user_id: userId, manga_id: mangaId } });

      if (checkBookmark) {
        // If bookmark exists, update it
        checkBookmark.bookmark_type = type;
        checkBookmark.notes = notes || null;
        await checkBookmark.save();
        return {
          success: true,
          data: {
            bookmark: checkBookmark,
            created: false
          }
        };
      } else {
        // If bookmark doesn't exist, create it
        const newBookmark = await Bookmark.create({
          user_id: userId,
          manga_id: mangaId,
          bookmark_type: type,
          notes: notes || null
        });
        return {
          success: true,
          data: {
            bookmark: newBookmark,
            created: true
          }
        };
      }
    } catch (error) {
        console.log('error:', error);
      return { success: false, error };
    }
  },

  // Update an existing bookmark
  async updateBookmark({ bookmarkId, userId, type, notes }) {
    try {
      const bookmark = await Bookmark.findOne({
        where: { id: bookmarkId, user_id: userId }
      });

      if (!bookmark) {
        return {
          success: false,
          error: new Error('Bookmark not found or access denied')
        };
      }

      // Validate type if provided
      if (type && !Bookmark.getValidTypes().includes(type)) {
        return {
          success: false,
          error: new Error(`Invalid bookmark type. Valid types: ${Bookmark.getValidTypes().join(', ')}`)
        };
      }

      // Update fields
      if (type !== undefined) bookmark.bookmark_type = type;
      if (notes !== undefined) bookmark.notes = notes;

      await bookmark.save();

      // Fetch updated bookmark with details
      const updatedBookmark = await Bookmark.findByPk(bookmark.id, {
        include: [
          {
            model: Book,
            as: 'manga',
            include: [
              {
                model: BookDetail,
                as: 'bookDetail',
                attributes: ['title', 'author', 'bannerUrl', 'rating', 'status', 'latestChapter']
              }
            ]
          }
        ]
      });

      return {
        success: true,
        data: { bookmark: updatedBookmark }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Delete a bookmark
  async deleteBookmark({ bookKey, userId }) {
    console.log('Deleting bookmark:', bookKey);
    try {
      const bookmark = await Bookmark.findOne({
        where: { manga_id: bookKey, user_id: userId }
      });

      if (!bookmark) {
        return {
          success: false,
          error: new Error('Bookmark not found or access denied')
        };
      }

      await bookmark.destroy();

      return {
        success: true,
        data: { message: 'Bookmark deleted successfully' }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Check if a manga is bookmarked by user
  async checkBookmarkStatus({ userId, mangaId }) {
    try {
      const bookmark = await Bookmark.findOne({
        where: { user_id: userId, manga_id: mangaId },
        include: [
          {
            model: Book,
            as: 'manga',
            include: [
              {
                model: BookDetail,
                as: 'bookDetail',
                attributes: ['title', 'author', 'bannerUrl']
              }
            ]
          }
        ]
      });

      return {
        success: true,
        data: {
          isBookmarked: !!bookmark,
          bookmark: bookmark || null
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get bookmark statistics for a user
  async getBookmarkStats({ userId }) {
    try {
      const stats = await Bookmark.findAll({
        where: { user_id: userId },
        attributes: [
          'bookmark_type',
          [Bookmark.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['bookmark_type'],
        raw: true
      });

      const total = await Bookmark.count({ where: { user_id: userId } });

      const byType = {};
      Bookmark.getValidTypes().forEach(type => {
        byType[type] = 0;
      });

      stats.forEach(stat => {
        byType[stat.bookmark_type] = parseInt(stat.count);
      });

      return {
        success: true,
        data: {
          total,
          by_type: byType,
          type_display_names: Bookmark.getTypeDisplayNames()
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Bulk bookmark operations
  async bulkCreateBookmarks({ userId, bookmarks }) {
    try {
      const validTypes = Bookmark.getValidTypes();
      const bookmarksToCreate = [];

      // Validate all bookmarks first
      for (const bookmark of bookmarks) {
        if (!validTypes.includes(bookmark.type)) {
          return {
            success: false,
            error: new Error(`Invalid bookmark type "${bookmark.type}" for manga ${bookmark.mangaId}`)
          };
        }

        // Check if manga exists
        const manga = await Book.findOne({ where: { bookKey: bookmark.mangaId } });
        if (!manga) {
          return {
            success: false,
            error: new Error(`Manga not found: ${bookmark.mangaId}`)
          };
        }

        bookmarksToCreate.push({
          user_id: userId,
          manga_id: bookmark.mangaId,
          bookmark_type: bookmark.type,
          notes: bookmark.notes || null
        });
      }

      // Use bulkCreate with ignoreDuplicates to handle existing bookmarks
      const createdBookmarks = await Bookmark.bulkCreate(bookmarksToCreate, {
        ignoreDuplicates: true,
        returning: true
      });

      return {
        success: true,
        data: {
          created: createdBookmarks.length,
          total_requested: bookmarks.length
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Export user bookmarks
  async exportBookmarks({ userId, format = 'json' }) {
    try {
      const bookmarks = await Bookmark.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Book,
            as: 'manga',
            include: [
              {
                model: BookDetail,
                as: 'bookDetail',
                attributes: ['title', 'author', 'bannerUrl', 'rating', 'status']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const exportData = bookmarks.map(bookmark => ({
        mangaId: bookmark.manga_id,
        title: bookmark.manga?.bookDetail?.title,
        author: bookmark.manga?.bookDetail?.author,
        type: bookmark.bookmark_type,
        notes: bookmark.notes,
        dateAdded: bookmark.created_at,
        lastUpdated: bookmark.updated_at
      }));

      return {
        success: true,
        data: {
          bookmarks: exportData,
          exportDate: new Date().toISOString(),
          totalCount: exportData.length,
          format
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  }
};

export default bookmarkService;