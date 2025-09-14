const genresService = require('../services/genresService');

exports.getGenres = async (req, res) => {
  try {
    const genres = await genresService.getGenres();
    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
