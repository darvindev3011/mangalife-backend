'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reading_sessions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      history_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'reading_history',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      session_start: {
        allowNull: false,
        type: Sequelize.DATE
      },
      session_end: {
        allowNull: true,
        type: Sequelize.DATE
      },
      pages_read: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      session_duration_seconds: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Stores browser, OS, screen resolution etc.'
      },
      ip_address: {
        type: Sequelize.STRING(45), // IPv6 compatible
        allowNull: true
      },
      user_agent: {
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

    // Add indexes for analytics queries
    await queryInterface.addIndex('reading_sessions', ['history_id'], {
      name: 'idx_reading_sessions_history_id'
    });

    await queryInterface.addIndex('reading_sessions', ['user_id'], {
      name: 'idx_reading_sessions_user_id'
    });

    await queryInterface.addIndex('reading_sessions', ['session_start'], {
      name: 'idx_reading_sessions_session_start'
    });

    await queryInterface.addIndex('reading_sessions', ['user_id', 'session_start'], {
      name: 'idx_reading_sessions_user_session_start'
    });

    await queryInterface.addIndex('reading_sessions', ['session_duration_seconds'], {
      name: 'idx_reading_sessions_duration'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('reading_sessions', 'idx_reading_sessions_history_id');
    await queryInterface.removeIndex('reading_sessions', 'idx_reading_sessions_user_id');
    await queryInterface.removeIndex('reading_sessions', 'idx_reading_sessions_session_start');
    await queryInterface.removeIndex('reading_sessions', 'idx_reading_sessions_user_session_start');
    await queryInterface.removeIndex('reading_sessions', 'idx_reading_sessions_duration');
    
    // Drop table
    await queryInterface.dropTable('reading_sessions');
  }
};