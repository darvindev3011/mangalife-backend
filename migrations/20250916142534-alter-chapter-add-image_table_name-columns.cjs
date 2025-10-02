'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chapters', 'image_table_name', {
      type: Sequelize.TEXT,
      defaultValue: null
    });

  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('chapters', 'image_table_name');
  },
};
