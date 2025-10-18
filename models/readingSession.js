import { DataTypes } from 'sequelize';

const ReadingSessionInit = (sequelize) => {
  const ReadingSession = sequelize.define('ReadingSession', {
    history_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reading_history',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    session_start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    session_end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pages_read: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        isInt: true
      }
    },
    session_duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        isInt: true
      }
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Stores browser, OS, screen resolution etc.'
    },
    ip_address: {
      type: DataTypes.STRING(45), // IPv6 compatible
      allowNull: true,
      validate: {
        isIP: true
      }
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'reading_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['history_id'],
        name: 'idx_reading_sessions_history_id'
      },
      {
        fields: ['user_id'],
        name: 'idx_reading_sessions_user_id'
      },
      {
        fields: ['session_start'],
        name: 'idx_reading_sessions_session_start'
      },
      {
        fields: ['user_id', 'session_start'],
        name: 'idx_reading_sessions_user_session_start'
      },
      {
        fields: ['session_duration_seconds'],
        name: 'idx_reading_sessions_duration'
      }
    ],
    hooks: {
      beforeSave: async (instance) => {
        // Auto-calculate session duration if both start and end times are available
        if (instance.session_start && instance.session_end && !instance.session_duration_seconds) {
          const startTime = new Date(instance.session_start);
          const endTime = new Date(instance.session_end);
          instance.session_duration_seconds = Math.floor((endTime - startTime) / 1000);
        }
      }
    }
  });

  // Instance methods
  ReadingSession.prototype.calculateDuration = function() {
    if (this.session_start && this.session_end) {
      const startTime = new Date(this.session_start);
      const endTime = new Date(this.session_end);
      return Math.floor((endTime - startTime) / 1000); // Duration in seconds
    }
    return 0;
  };

  ReadingSession.prototype.getDurationFormatted = function() {
    const duration = this.session_duration_seconds || this.calculateDuration();
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  ReadingSession.prototype.isActiveSession = function() {
    return this.session_start && !this.session_end;
  };

  ReadingSession.prototype.endSession = function() {
    this.session_end = new Date();
    this.session_duration_seconds = this.calculateDuration();
    return this.save();
  };

  // Static methods
  ReadingSession.createDeviceInfo = function(userAgent, additionalInfo = {}) {
    const deviceInfo = {
      userAgent: userAgent || 'unknown',
      timestamp: new Date().toISOString(),
      ...additionalInfo
    };

    // Parse user agent for basic info
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      deviceInfo.browser = 'unknown';
      deviceInfo.os = 'unknown';

      // Detect browser
      if (ua.includes('chrome')) deviceInfo.browser = 'chrome';
      else if (ua.includes('firefox')) deviceInfo.browser = 'firefox';
      else if (ua.includes('safari')) deviceInfo.browser = 'safari';
      else if (ua.includes('edge')) deviceInfo.browser = 'edge';

      // Detect OS
      if (ua.includes('windows')) deviceInfo.os = 'windows';
      else if (ua.includes('macintosh') || ua.includes('mac os')) deviceInfo.os = 'macos';
      else if (ua.includes('linux')) deviceInfo.os = 'linux';
      else if (ua.includes('android')) deviceInfo.os = 'android';
      else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) deviceInfo.os = 'ios';
    }

    return deviceInfo;
  };

  ReadingSession.getActiveSessionsForUser = function(userId) {
    return this.findAll({
      where: {
        user_id: userId,
        session_end: null
      },
      order: [['session_start', 'DESC']]
    });
  };

  return ReadingSession;
};

export default ReadingSessionInit;