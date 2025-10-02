'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chapters', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      bookKey: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      chapterNo: Sequelize.STRING,
      chapterUrl: Sequelize.STRING,
      chapterDate: Sequelize.STRING,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('chapters');
  },
};
