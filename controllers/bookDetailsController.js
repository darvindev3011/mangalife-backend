import bookDetailsService from '../services/bookDetailsService.js';
import { sendResponse } from '../utils/response.js';

export const getBookDetails = async (req, res) => {
  const { bookKey } = req.params;
  const result = await bookDetailsService.getBookDetails(bookKey);
  if (result.success) {
    sendResponse(res, { status: 200, message: 'Book details fetched', data: result.data });
  } else {
    sendResponse(res, { status: 500, message: 'Failed to fetch book details', error: result.error });
  }
};

export default { getBookDetails };
