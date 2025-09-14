const { Chapter } = require("../models");

exports.getChapterList = async (bookKey) => {
  return await Chapter.findAll({
    where: { bookKey },
    order: [["chapterNo", "DESC"]],
  });
};
