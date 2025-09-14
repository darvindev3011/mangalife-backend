const bookDetailsService = require('../services/bookDetailsService');

exports.getBookDetails = async (req, res) => {
  try {
    const { bookKey } = req.params;
    const result = await bookDetailsService.getBookDetails(bookKey);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
