import booksService from '../services/booksService.js';
import { sendResponse } from '../utils/response.js';

export const getBooks = async (req, res) => {
  const { page = 1, limit = 20, genre } = req.query;
  const result = await booksService.getBooks({ page, limit, genre });
  if (result.success) {
    sendResponse(res, { status: 200, message: 'Books fetched', data: result.data });
  } else {
    sendResponse(res, { status: 500, message: 'Failed to fetch books', error: result.error });
  }
};

export const searchBooks = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return sendResponse(res, { status: 400, message: 'Missing search query', error: 'Missing search query' });
  }
  const result = await booksService.searchBooks(q);
  if (result.success) {
    sendResponse(res, { status: 200, message: 'Books search result', data: result.data });
  } else {
    sendResponse(res, { status: 500, message: 'Failed to search books', error: result.error });
  }
};

export default { getBooks, searchBooks };
