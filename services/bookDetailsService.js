import { BookDetail } from '../models/index.js';

const getBookDetails = async (bookKey) => {
  try {
    const result = await BookDetail.findOne({ where: { bookKey } });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error };
  }
};

export default { getBookDetails };
