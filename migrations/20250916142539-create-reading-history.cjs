'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reading_history', {
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
      chapter_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      chapter_title: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      page_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      total_pages: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1
        }
      },
      reading_progress: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
          min: 0,
          max: 100
        }
      },
      reading_time_seconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      read_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      device_type: {
        type: Sequelize.ENUM('mobile', 'tablet', 'desktop', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // Add unique constraint for user_id + manga_id + chapter_number combination
    await queryInterface.addConstraint('reading_history', {
      fields: ['user_id', 'manga_id', 'chapter_number'],
      type: 'unique',
      name: 'unique_user_manga_chapter_history'
    });

    // Add indexes for performance
    await queryInterface.addIndex('reading_history', ['user_id'], {
      name: 'idx_reading_history_user_id'
    });

    await queryInterface.addIndex('reading_history', ['manga_id'], {
      name: 'idx_reading_history_manga_id'
    });

    await queryInterface.addIndex('reading_history', ['read_at'], {
      name: 'idx_reading_history_read_at'
    });

    await queryInterface.addIndex('reading_history', ['chapter_number'], {
      name: 'idx_reading_history_chapter_number'
    });

    await queryInterface.addIndex('reading_history', ['user_id', 'manga_id'], {
      name: 'idx_reading_history_user_manga'
    });

    await queryInterface.addIndex('reading_history', ['user_id', 'read_at'], {
      name: 'idx_reading_history_user_read_at'
    });

    await queryInterface.addIndex('reading_history', ['user_id', 'is_completed'], {
      name: 'idx_reading_history_user_completed'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('reading_history', 'idx_reading_history_user_id');
    await queryInterface.removeIndex('reading_history', 'idx_reading_history_manga_id');
    await queryInterface.removeIndex('reading_history', 'idx_reading_history_read_at');
    await queryInterface.removeIndex('reading_history', 'idx_reading_history_chapter_number');
    await queryInterface.removeIndex('reading_history', 'idx_reading_history_user_manga');
    await queryInterface.removeIndex('reading_history', 'idx_reading_history_user_read_at');
    await queryInterface.removeIndex('reading_history', 'idx_reading_history_user_completed');
    
    // Remove constraint
    await queryInterface.removeConstraint('reading_history', 'unique_user_manga_chapter_history');
    
    // Drop table
    await queryInterface.dropTable('reading_history');
  }
};