'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chapter_images', {
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
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('chapter_images');
  },
};
