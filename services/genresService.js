const { Genre } = require('../models');

exports.getGenres = async () => {
  return await Genre.findAndCountAll({ order: [['name', 'ASC']] });
};
