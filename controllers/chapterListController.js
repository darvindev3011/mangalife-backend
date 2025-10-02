import chapterListService from '../services/chapterListService.js';
import { sendResponse } from '../utils/response.js';

export const getChapterList = async (req, res) => {
  const { bookKey } = req.params;
  const result = await chapterListService.getChapterList(bookKey);
  if (result.success) {
    sendResponse(res, { status: 200, message: 'Chapter list fetched', data: result.data });
  } else {
    sendResponse(res, { status: 500, message: 'Failed to fetch chapter list', error: result.error });
  }
};

export default { getChapterList };