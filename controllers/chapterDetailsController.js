const chapterDetailsService = require('../services/chapterDetailsService');

exports.getChapterDetails = async (req, res) => {
  try {
    const { bookKey, chapterNo } = req.params;
    const result = await chapterDetailsService.getChapterDetails(bookKey, chapterNo);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
