import genresService from '../services/genresService.js';

export const getGenres = async (req, res) => {
  try {
    const genres = await genresService.getGenres();
    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default { getGenres };