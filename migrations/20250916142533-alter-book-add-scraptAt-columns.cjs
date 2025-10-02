'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('books', 'scrapedAt', {
      type: Sequelize.DATE,
      defaultValue: null
    });
    await queryInterface.addColumn('bookDetails', 'scrapedAt', {
      type: Sequelize.DATE,
      defaultValue: null
    });
    await queryInterface.addColumn('chapters', 'scrapedAt', {
      type: Sequelize.DATE,
      defaultValue: null
    });

  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('books', 'scrapedAt');
    await queryInterface.removeColumn('bookDetails', 'scrapedAt');
    await queryInterface.removeColumn('chapters', 'scrapedAt');
  },
};
