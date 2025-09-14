import { Book, BookDetail } from "../models/index.js";
import { Op } from "sequelize";

const getBooks = async ({ page, limit, genre }) => {
  // add where clause for active books only
  const where = {};
  if (genre) {
    where.genres = {
      [Op.like]: `%${genre}%`
    };
  }
  const offset = (page - 1) * limit;
  return await Book.findAndCountAll({
    include: [
      {
        model: BookDetail,
        as: "bookDetail",
        where: {
          ...where
        }
      },
    ],
    offset: Number(offset),
    limit: Number(limit),
    order: [["createdAt", "DESC"]],
  });
};

const searchBooks = async (query) => {
  return await BookDetail.findAll({
    attributes: ['bookKey', 'title', 'author', 'bannerUrl'],
    where: {
      title: { [Op.iLike]: `%${query}%` }
    },
    limit: 10,
    order: [["title", "ASC"]],
  });
};

export default { getBooks, searchBooks };
