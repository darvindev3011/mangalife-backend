import genresService from '../services/genresService.js';
import { sendResponse } from '../utils/response.js';

export const getGenres = async (req, res) => {
  const result = await genresService.getGenres();
  if (result.success) {
    sendResponse(res, { status: 200, message: 'Genres fetched', data: result.data });
  } else {
    sendResponse(res, { status: 500, message: 'Failed to fetch genres', error: result.error });
  }
};

export default { getGenres };