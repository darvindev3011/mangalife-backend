'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chapters', 'does_chapter', {
      type: Sequelize.TEXT,
      defaultValue: null
    });

  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('chapters', 'does_chapter');
  },
};
