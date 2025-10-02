import { Genre } from '../models/index.js';

const getGenres = async () => {
  try {
    const result = await Genre.findAndCountAll({ order: [['name', 'ASC']] });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error };
  }
};

export default { getGenres };
