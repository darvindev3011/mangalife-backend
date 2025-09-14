const { Chapter, ChapterImage } = require("../models");
const { Op, or } = require("sequelize");
const { sequelize } = require("../models");

exports.getChapterDetails = async (bookKey, chapterNo) => {
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
      chapter,
      images,
      prevChapterUrl: prevChapter ? `${frontUrl}/manga/${prevChapter.bookKey}/chapter/${prevChapter.chapterNo}` : null,
      nextChapterUrl: nextChapter ? `${frontUrl}/manga/${nextChapter.bookKey}/chapter/${nextChapter.chapterNo}` : null,
    };
  } catch (error) {
    console.error("Error fetching chapter details:", error);
    throw error;
  }
};
