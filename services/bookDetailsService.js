import { BookDetail } from '../models/index.js';

const getBookDetails = async (bookKey) => {
  return await BookDetail.findOne({ where: { bookKey } });
};

export default { getBookDetails };
