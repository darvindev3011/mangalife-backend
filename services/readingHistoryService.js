import chapter from '../models/chapter.js';
import { ReadingHistory, ReadingSession, Book, BookDetail, User, Bookmark } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

const readingHistoryService = {
  // Get paginated reading history for a user
  async getUserReadingHistory({ userId, page = 1, limit = 50, mangaId, days }) {
    try {
      console.log('mangaId:', mangaId);
      const offset = (page - 1) * limit;
      const where = { user_id: userId };
      
      // Filter by specific manga if provided
      if (mangaId) {
        where.manga_id = mangaId;
      }

      // Filter by recent days if provided
      if (days && days > 0) {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);
        where.read_at = {
          [Op.gte]: dateFrom
        };
      }

      const result = await ReadingHistory.findAndCountAll({
        where,
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
          },
          {
            model: ReadingSession,
            as: 'sessions',
            limit: 1,
            order: [['session_start', 'DESC']]
          }
        ],
        offset: Number(offset),
        limit: Number(limit),
        order: [['read_at', 'DESC']],
        distinct: true
      });

      const totalPages = Math.ceil(result.count / limit);

      return {
        success: true,
        data: {
          totalItems: result.count,
          history: result.rows,
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
      console.log('error:', error);
      return { success: false, error };
    }
  },

  // Record or update reading progress
  async recordReadingProgress({ userId, mangaId, chapterNumber, chapterTitle, pageNumber, totalPages, readingTimeSeconds, deviceType, userAgent, ipAddress }) {
    try {
      // Validate manga exists
      const manga = await Book.findOne({ where: { bookKey: mangaId } });
      if (!manga) {
        return {
          success: false,
          error: new Error('Manga not found')
        };
      }

      // Detect device type if not provided
      if (!deviceType && userAgent) {
        deviceType = ReadingHistory.detectDeviceType(userAgent);
      }

      // Calculate reading progress
      let readingProgress = 0;
      if (totalPages && pageNumber) {
        readingProgress = Math.min(100, (pageNumber / totalPages) * 100);
      }
      
      // Check if reading history already exists for this user, manga, and chapter
      const existingHistory = await ReadingHistory.findOne({
        where: {
          user_id: userId,
          manga_id: mangaId,
          chapter_number: chapterNumber
        }
      });

      let historyEntry;
      let created = false;

      const historyData = {
        user_id: userId,
        manga_id: mangaId,
        chapter_number: chapterNumber,
        chapter_title: chapterTitle || null,
        page_number: pageNumber,
        total_pages: totalPages || null,
        reading_progress: readingProgress,
        reading_time_seconds: readingTimeSeconds || 0,
        device_type: deviceType || 'unknown',
        is_completed: totalPages && pageNumber >= totalPages,
        read_at: new Date()
      };

      if (existingHistory) {
        // Update existing history entry
        await existingHistory.update(historyData);
        historyEntry = existingHistory;
        created = false;
      } else {
        // Create new history entry
        historyEntry = await ReadingHistory.create(historyData);
        created = true;
      }

      // Create reading session if reading time is provided
      if (readingTimeSeconds && readingTimeSeconds > 0) {
        const sessionStart = new Date(Date.now() - (readingTimeSeconds * 1000));
        const deviceInfo = ReadingSession.createDeviceInfo(userAgent);
        
        await ReadingSession.create({
          history_id: historyEntry.id,
          user_id: userId,
          session_start: sessionStart,
          session_end: new Date(),
          pages_read: created ? pageNumber : Math.max(0, pageNumber - (existingHistory?.page_number || 0)),
          session_duration_seconds: readingTimeSeconds,
          device_info: deviceInfo,
          ip_address: ipAddress || null,
          user_agent: userAgent || null
        });
      }

      // Fetch the complete history entry with manga details
      const historyWithDetails = await ReadingHistory.findByPk(historyEntry.id, {
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
        data: {
          history: historyWithDetails,
          created,
          isChapterCompleted: totalPages && pageNumber >= totalPages
        }
      };
    } catch (error) {
      console.log('error:', error);
      return { success: false, error };
    }
  },

  // Get reading history for specific manga
  async getMangaReadingHistory({ userId, mangaId, chapterNumber }) {
    try {
      const history = await ReadingHistory.findOne({
        where: { user_id: userId, manga_id: mangaId, chapter_number: chapterNumber },
        order: [['chapter_number', 'ASC']],
        include: [
          {
            model: ReadingSession,
            as: 'sessions',
            order: [['session_start', 'DESC']]
          }
        ]
      });

      return {
        success: true,
        data: {
          history,
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get current reading progress for specific manga
  async getMangaProgress({ userId, mangaId }) {
    try {
      const latestHistory = await ReadingHistory.findOne({
        where: { user_id: userId, manga_id: mangaId},
        order: [['chapter_number', 'DESC'], ['read_at', 'DESC']],
        include: [
          {
            model: Book,
            as: 'manga',
            include: [
              {
                model: BookDetail,
                as: 'bookDetail',
                attributes: ['title', 'author', 'latestChapter']
              }
            ]
          }
        ]
      });

      if (!latestHistory) {
        return {
          success: true,
          data: {
            current_chapter: 0,
            current_page: 0,
            total_chapters_read: 0,
            reading_progress_percentage: 0,
            last_read_at: null
          }
        };
      }

      const totalChaptersRead = await ReadingHistory.count({
        where: { user_id: userId, manga_id: mangaId }
      });

      return {
        success: true,
        data: {
          current_chapter: latestHistory.chapter_number,
          current_page: latestHistory.page_number,
          total_pages: latestHistory.total_pages,
          total_chapters_read: totalChaptersRead,
          reading_progress_percentage: latestHistory.reading_progress,
          last_read_at: latestHistory.read_at,
          is_chapter_completed: latestHistory.is_completed,
          manga_title: latestHistory.manga?.bookDetail?.title
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get user reading statistics
  async getReadingStats({ userId, days = 30 }) {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      // Total unique manga read
      const totalMangaRead = await ReadingHistory.count({
        where: { user_id: userId },
        distinct: true,
        col: 'manga_id'
      });

      // Total chapters read
      const totalChaptersRead = await ReadingHistory.count({
        where: { user_id: userId }
      });

      // Total reading time
      const totalTimeResult = await ReadingHistory.findOne({
        where: { user_id: userId },
        attributes: [[Sequelize.fn('SUM', Sequelize.col('reading_time_seconds')), 'total_time']],
        raw: true
      });
      const totalReadingTimeSeconds = parseInt(totalTimeResult?.total_time || 0);

      // Calculate reading streak (consecutive days with reading activity)
      const recentDays = await ReadingHistory.findAll({
        where: {
          user_id: userId,
          read_at: { [Op.gte]: dateFrom }
        },
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('read_at')), 'read_date']
        ],
        group: [Sequelize.fn('DATE', Sequelize.col('read_at'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('read_at')), 'DESC']],
        raw: true
      });

      let readingStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      let currentDate = new Date();

      for (const day of recentDays) {
        const dayStr = currentDate.toISOString().split('T')[0];
        if (recentDays.some(d => d.read_date === dayStr)) {
          readingStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Recently read manga (last 10)
      const recentlyRead = await ReadingHistory.findAll({
        where: { user_id: userId },
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
        ],
        order: [['read_at', 'DESC']],
        limit: 10,
        distinct: true,
        col: 'manga_id'
      });

      // Reading activity chart (daily reading time for the past month)
      const activityChart = await ReadingHistory.findAll({
        where: {
          user_id: userId,
          read_at: { [Op.gte]: dateFrom }
        },
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('read_at')), 'date'],
          [Sequelize.fn('SUM', Sequelize.col('reading_time_seconds')), 'reading_time']
        ],
        group: [Sequelize.fn('DATE', Sequelize.col('read_at'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('read_at')), 'ASC']],
        raw: true
      });

      return {
        success: true,
        data: {
          total_manga_read: totalMangaRead,
          total_chapters_read: totalChaptersRead,
          total_reading_time_seconds: totalReadingTimeSeconds,
          total_reading_time_hours: Math.round(totalReadingTimeSeconds / 3600 * 100) / 100,
          reading_streak_days: readingStreak,
          recently_read: recentlyRead,
          reading_activity_chart: activityChart.map(item => ({
            date: item.date,
            reading_time_seconds: parseInt(item.reading_time),
            reading_time_minutes: Math.round(parseInt(item.reading_time) / 60)
          }))
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get continue reading list
  async getContinueReading({ userId, limit = 15 }) {
    try {
      // Get latest reading history for each manga, excluding completed ones
      const latestReadings = await ReadingHistory.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Book,
            as: 'manga',
            include: [
              {
                model: BookDetail,
                as: 'bookDetail',
                attributes: ['title', 'author', 'bannerUrl', 'status', 'latestChapter']
              }
            ]
          }
        ],
        order: [['manga_id', 'ASC'], ['chapter_number', 'DESC'], ['read_at', 'DESC']],
        raw: false
      });

      // Group by manga and get the latest reading for each
      const mangaMap = new Map();
      latestReadings.forEach(reading => {
        if (!mangaMap.has(reading.manga_id)) {
          mangaMap.set(reading.manga_id, reading);
        }
      });

      // Filter out completed manga and sort by last read time
      const continueReading = Array.from(mangaMap.values())
        .filter(reading => !reading.is_completed || reading.total_pages === null)
        .sort((a, b) => new Date(b.read_at) - new Date(a.read_at))
        .slice(0, limit);

      return {
        success: true,
        data: {
          continue_reading: continueReading,
          total_count: continueReading.length
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Mark manga as completed
  async markMangaCompleted({ userId, mangaId }) {
    try {
      const manga = await Book.findOne({ where: { bookKey: mangaId } });
      if (!manga) {
        return {
          success: false,
          error: new Error('Manga not found')
        };
      }

      // Update all reading history entries for this manga to completed
      await ReadingHistory.update(
        { is_completed: true },
        { 
          where: { 
            user_id: userId, 
            manga_id: mangaId 
          } 
        }
      );

      // Update bookmark status if exists
      const bookmark = await Bookmark.findOne({
        where: { user_id: userId, manga_id: mangaId }
      });

      if (bookmark) {
        bookmark.bookmark_type = 'completed';
        await bookmark.save();
      }

      return {
        success: true,
        data: {
          message: 'Manga marked as completed',
          bookmark_updated: !!bookmark
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Delete reading history entry
  async deleteHistoryEntry({ userId, historyId }) {
    try {
      const historyEntry = await ReadingHistory.findOne({
        where: { id: historyId, user_id: userId }
      });

      if (!historyEntry) {
        return {
          success: false,
          error: new Error('Reading history entry not found or access denied')
        };
      }

      // Delete associated reading sessions first
      await ReadingSession.destroy({
        where: { history_id: historyId }
      });

      await historyEntry.destroy();

      return {
        success: true,
        data: { message: 'Reading history entry deleted successfully' }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Helper method to format reading time
  formatReadingTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  },

  // Start a reading session
  async startReadingSession({ userId, mangaId, chapterNumber, userAgent, ipAddress }) {
    try {
      // Find or validate reading history entry exists
      const historyEntry = await ReadingHistory.findOne({
        where: {
          user_id: userId,
          manga_id: mangaId,
          chapter_number: chapterNumber
        }
      });

      if (!historyEntry) {
        return {
          success: false,
          error: new Error('Reading history not found. Please record reading progress first.')
        };
      }

      // Check for existing active session
      const existingSession = await ReadingSession.findOne({
        where: {
          user_id: userId,
          history_id: historyEntry.id,
          session_end: null
        }
      });

      if (existingSession) {
        return {
          success: true,
          data: {
            session: existingSession,
            message: 'Reading session already active'
          }
        };
      }

      // Create new reading session
      const deviceInfo = ReadingSession.createDeviceInfo(userAgent);

      const session = await ReadingSession.create({
        history_id: historyEntry.id,
        user_id: userId,
        session_start: new Date(),
        session_end: null,
        pages_read: 0,
        device_info: deviceInfo,
        ip_address: ipAddress || null,
        user_agent: userAgent || null
      });

      return {
        success: true,
        data: {
          session,
          created: true,
          message: 'Reading session started successfully'
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // End a reading session
  async endReadingSession({ userId, sessionId, pagesRead }) {
    try {
      // Find active session for this user
      const session = await ReadingSession.findOne({
        where: {
          id: sessionId,
          user_id: userId,
          session_end: null
        }
      });

      if (!session) {
        return {
          success: false,
          error: new Error('Active reading session not found or already ended')
        };
      }

      // End the session
      session.session_end = new Date();
      session.session_duration_seconds = session.calculateDuration();
      
      if (pagesRead !== undefined) {
        session.pages_read = Math.max(0, parseInt(pagesRead) || 0);
      }

      await session.save();

      return {
        success: true,
        data: {
          session,
          message: 'Reading session ended successfully'
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get active sessions for a user
  async getActiveSessions({ userId }) {
    try {
      const activeSessions = await ReadingSession.findAll({
        where: {
          user_id: userId,
          session_end: null
        },
        include: [
          {
            model: ReadingHistory,
            as: 'readingHistory',
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
          }
        ],
        order: [['session_start', 'DESC']]
      });

      return {
        success: true,
        data: {
          active_sessions: activeSessions,
          count: activeSessions.length
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  }
};

export default readingHistoryService;