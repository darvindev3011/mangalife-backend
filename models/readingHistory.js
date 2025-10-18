import { DataTypes } from 'sequelize';

const ReadingHistoryInit = (sequelize) => {
  const ReadingHistory = sequelize.define('ReadingHistory', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    manga_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'books',
        key: 'bookKey'
      }
    },
    chapter_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chapter_title: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    page_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        isInt: true
      }
    },
    total_pages: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        isInt: true
      }
    },
    reading_progress: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.00,
      validate: {
        min: 0,
        max: 100
      }
    },
    reading_time_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        isInt: true
      }
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    device_type: {
      type: DataTypes.ENUM('mobile', 'tablet', 'desktop', 'unknown'),
      allowNull: false,
      defaultValue: 'unknown',
      validate: {
        isIn: [['mobile', 'tablet', 'desktop', 'unknown']]
      }
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'reading_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'manga_id', 'chapter_number'],
        name: 'unique_user_manga_chapter_history'
      },
      {
        fields: ['user_id'],
        name: 'idx_reading_history_user_id'
      },
      {
        fields: ['manga_id'],
        name: 'idx_reading_history_manga_id'
      },
      {
        fields: ['read_at'],
        name: 'idx_reading_history_read_at'
      },
      {
        fields: ['chapter_number'],
        name: 'idx_reading_history_chapter_number'
      },
      {
        fields: ['user_id', 'manga_id'],
        name: 'idx_reading_history_user_manga'
      },
      {
        fields: ['user_id', 'read_at'],
        name: 'idx_reading_history_user_read_at'
      },
      {
        fields: ['user_id', 'is_completed'],
        name: 'idx_reading_history_user_completed'
      }
    ],
    hooks: {
      beforeSave: async (instance) => {
        // Auto-calculate reading progress if total_pages is available
        if (instance.total_pages && instance.page_number) {
          instance.reading_progress = Math.min(100, (instance.page_number / instance.total_pages) * 100);
        }
        
        // Auto-mark as completed if page equals total pages
        if (instance.total_pages && instance.page_number >= instance.total_pages) {
          instance.is_completed = true;
          instance.reading_progress = 100;
        }
      }
    }
  });

  // Instance methods
  ReadingHistory.prototype.calculateProgress = function() {
    if (this.total_pages && this.page_number) {
      return Math.min(100, (this.page_number / this.total_pages) * 100);
    }
    return 0;
  };

  ReadingHistory.prototype.isChapterCompleted = function() {
    return this.total_pages && this.page_number >= this.total_pages;
  };

  ReadingHistory.prototype.getReadingTimeFormatted = function() {
    const hours = Math.floor(this.reading_time_seconds / 3600);
    const minutes = Math.floor((this.reading_time_seconds % 3600) / 60);
    const seconds = this.reading_time_seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Static methods
  ReadingHistory.getValidDeviceTypes = function() {
    return ['mobile', 'tablet', 'desktop', 'unknown'];
  };

  ReadingHistory.detectDeviceType = function(userAgent) {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else if (ua.includes('desktop') || ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
      return 'desktop';
    }
    return 'unknown';
  };

  return ReadingHistory;
};

export default ReadingHistoryInit;