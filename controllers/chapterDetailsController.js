import chapterDetailsService from '../services/chapterDetailsService.js';
import { sendResponse } from '../utils/response.js';

export const getChapterDetails = async (req, res) => {
  const { bookKey, chapterNo } = req.params;
  const result = await chapterDetailsService.getChapterDetails(bookKey, chapterNo);
  if (result.success) {
    sendResponse(res, { status: 200, message: 'Chapter details fetched', data: result.data });
  } else {
    sendResponse(res, { status: 500, message: 'Failed to fetch chapter details', error: result.error });
  }
};

export default { getChapterDetails };