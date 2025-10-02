'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chapter_images', 'imageName', {
      type: Sequelize.TEXT,
      defaultValue: null
    });
    await queryInterface.addColumn('chapter_images', 'scrapedAt', {
      type: Sequelize.DATE,
      defaultValue: null
    });
    await queryInterface.addColumn('chapter_images', 'isBigSize', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('chapter_images', 'imageName');
    await queryInterface.removeColumn('chapter_images', 'scrapedAt');
    await queryInterface.removeColumn('chapter_images', 'isBigSize');
  },
};
