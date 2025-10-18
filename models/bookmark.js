import { DataTypes } from 'sequelize';

const BookmarkInit = (sequelize) => {
  const Bookmark = sequelize.define('Bookmark', {
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
    bookmark_type: {
      type: DataTypes.ENUM('favorite', 'reading', 'completed', 'plan_to_read', 'dropped'),
      allowNull: false,
      defaultValue: 'favorite',
      validate: {
        isIn: [['favorite', 'reading', 'completed', 'plan_to_read', 'dropped']]
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000] // Maximum 2000 characters for notes
      }
    }
  }, {
    tableName: 'bookmarks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'manga_id'],
        name: 'unique_user_manga_bookmark'
      },
      {
        fields: ['user_id'],
        name: 'idx_bookmarks_user_id'
      },
      {
        fields: ['manga_id'],
        name: 'idx_bookmarks_manga_id'
      },
      {
        fields: ['bookmark_type'],
        name: 'idx_bookmarks_type'
      },
      {
        fields: ['created_at'],
        name: 'idx_bookmarks_created_at'
      },
      {
        fields: ['user_id', 'bookmark_type'],
        name: 'idx_bookmarks_user_type'
      }
    ],
    // Class methods
    classMethods: {
      associate: function(models) {
        // Associations will be defined in models/index.js
      }
    },
    // Instance methods
    instanceMethods: {
      toJSON: function() {
        const values = Object.assign({}, this.get());
        // Convert timestamps to ISO strings
        if (values.created_at) values.created_at = values.created_at.toISOString();
        if (values.updated_at) values.updated_at = values.updated_at.toISOString();
        return values;
      }
    }
  });

  // Static methods
  Bookmark.getValidTypes = function() {
    return ['favorite', 'reading', 'completed', 'plan_to_read', 'dropped'];
  };

  Bookmark.getTypeDisplayNames = function() {
    return {
      favorite: 'Favorite',
      reading: 'Currently Reading',
      completed: 'Completed',
      plan_to_read: 'Plan to Read',
      dropped: 'Dropped'
    };
  };

  return Bookmark;
};

export default BookmarkInit;