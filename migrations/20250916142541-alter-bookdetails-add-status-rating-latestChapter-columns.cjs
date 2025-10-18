'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bookDetails', 'rating', {
      type: Sequelize.FLOAT,
      defaultValue: null
    });
    await queryInterface.addColumn('bookDetails', 'status', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      comment: '1: ongoing, 2: completed, 3: onhold, 4: cancelled, 5: upcoming'
    });
    await queryInterface.addColumn('bookDetails', 'latestChapter', {
      type: Sequelize.STRING,
      defaultValue: null
    });

  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('bookDetails', 'rating');
    await queryInterface.removeColumn('bookDetails', 'status');
    await queryInterface.removeColumn('bookDetails', 'latestChapter');
  },
};
