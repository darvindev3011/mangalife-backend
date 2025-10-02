'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chapter_images_8', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cId: Sequelize.INTEGER,
      bookKey: Sequelize.STRING,
      chapterNo: Sequelize.STRING,
      imageUrl: Sequelize.STRING,
      isDownloaded: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      imageName: {
        type: Sequelize.TEXT,
        defaultValue: null
      },
      scrapedAt: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      isBigSize: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('chapter_images_8');
  },
};
