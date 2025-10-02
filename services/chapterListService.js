import { Chapter } from "../models/index.js";

const getChapterList = async (bookKey) => {
  try {
    const result = await Chapter.findAll({
      where: { bookKey },
      order: [["chapterNo", "DESC"]],
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error };
  }
};

export default { getChapterList };
