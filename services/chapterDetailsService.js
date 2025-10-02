import { Chapter, ChapterImage } from "../models/index.js";
import { Op, or } from "sequelize";
import { sequelize } from "../models/index.js";

const getChapterDetails = async (bookKey, chapterNo) => {
  try {
    const chapter = await Chapter.findOne({ where: { bookKey, chapterNo } });
    const images = await ChapterImage.findAll({
      where: { bookKey, chapterNo },
      order: [["id", "ASC"]],
    });

    const prevChapter = await Chapter.findOne({
      where: {
        bookKey,
        id: chapter.id + 1,
      },
      order: [["chapterNo", "ASC"]],
    });

    const nextChapter = await Chapter.findOne({
      where: {
        bookKey,
        id: chapter.id - 1,
      },
      order: [["chapterNo", "ASC"]],
    });

    const frontUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return {
      success: true,
      data: {
        chapter,
        images,
        prevChapterUrl: prevChapter ? `${frontUrl}/manga/${prevChapter.bookKey}/chapter/${prevChapter.chapterNo}` : null,
        nextChapterUrl: nextChapter ? `${frontUrl}/manga/${nextChapter.bookKey}/chapter/${nextChapter.chapterNo}` : null,
      }
    };
  } catch (error) {
    return { success: false, error };
  }
};

export default { getChapterDetails };
