import { Chapter } from "../models/index.js";

const getChapterList = async (bookKey) => {
  return await Chapter.findAll({
    where: { bookKey },
    order: [["chapterNo", "DESC"]],
  });
};

export default { getChapterList };
