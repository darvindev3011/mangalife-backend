const { BookDetail } = require('../models');

exports.getBookDetails = async (bookKey) => {
  return await BookDetail.findOne({ where: { bookKey } });
};
