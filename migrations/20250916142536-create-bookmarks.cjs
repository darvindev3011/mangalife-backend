'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookmarks', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      manga_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'books',
          key: 'bookKey'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bookmark_type: {
        type: Sequelize.ENUM('favorite', 'reading', 'completed', 'plan_to_read', 'dropped'),
        allowNull: false,
        defaultValue: 'favorite'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add unique constraint for user_id + manga_id combination
    await queryInterface.addConstraint('bookmarks', {
      fields: ['user_id', 'manga_id'],
      type: 'unique',
      name: 'unique_user_manga_bookmark'
    });

    // Add indexes for performance
    await queryInterface.addIndex('bookmarks', ['user_id'], {
      name: 'idx_bookmarks_user_id'
    });

    await queryInterface.addIndex('bookmarks', ['manga_id'], {
      name: 'idx_bookmarks_manga_id'
    });

    await queryInterface.addIndex('bookmarks', ['bookmark_type'], {
      name: 'idx_bookmarks_type'
    });

    await queryInterface.addIndex('bookmarks', ['created_at'], {
      name: 'idx_bookmarks_created_at'
    });

    await queryInterface.addIndex('bookmarks', ['user_id', 'bookmark_type'], {
      name: 'idx_bookmarks_user_type'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('bookmarks', 'idx_bookmarks_user_id');
    await queryInterface.removeIndex('bookmarks', 'idx_bookmarks_manga_id');
    await queryInterface.removeIndex('bookmarks', 'idx_bookmarks_type');
    await queryInterface.removeIndex('bookmarks', 'idx_bookmarks_created_at');
    await queryInterface.removeIndex('bookmarks', 'idx_bookmarks_user_type');
    
    // Remove constraint
    await queryInterface.removeConstraint('bookmarks', 'unique_user_manga_bookmark');
    
    // Drop table
    await queryInterface.dropTable('bookmarks');
  }
};