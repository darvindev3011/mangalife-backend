import { Genre } from '../models/index.js';

const getGenres = async () => {
  return await Genre.findAndCountAll({ order: [['name', 'ASC']] });
};

export default { getGenres };
