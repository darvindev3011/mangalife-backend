'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bookDetails', {
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
      title: Sequelize.STRING,
      bannerUrl: Sequelize.STRING,
      rank: Sequelize.STRING,
      authors: Sequelize.STRING,
      alternative: Sequelize.STRING,
      author: Sequelize.STRING,
      genres: Sequelize.STRING,
      summary: Sequelize.TEXT,
      tags: Sequelize.STRING,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('bookDetails');
  },
};
