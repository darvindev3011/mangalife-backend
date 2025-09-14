const booksService = require('../services/booksService');

exports.getBooks = async (req, res) => {
  try {
    // Pagination for infinite scroll
    const { page = 1, limit = 20, genre } = req.query;
    const result = await booksService.getBooks({ page, limit, genre });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Missing search query' });
    }
    const result = await booksService.searchBooks(q);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
