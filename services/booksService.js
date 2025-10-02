import { Book, BookDetail } from "../models/index.js";
import { Op } from "sequelize";

const getBooks = async ({ page, limit, genre }) => {
  try {
    const where = {};
    if (genre) {
      // Dialect-aware LIKE (Postgres needs iLike for case-insensitive search)
      const likeOp = Book.sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
      where.genres = { [likeOp]: `%${genre}%` };
    }
    const offset = (page - 1) * limit;
    const result = await Book.findAndCountAll({
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
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error };
  }
};

const searchBooks = async (query) => {
  try {
    if (!query || !query.trim()) {
      return { success: true, data: [] };
    }
    const dialect = BookDetail.sequelize.getDialect();
    const likeOp = dialect === 'postgres' ? Op.iLike : Op.like;
    const pattern = `%${query.trim()}%`;
    const result = await BookDetail.findAll({
      attributes: ['bookKey', 'title', 'author', 'bannerUrl'],
      where: { title: { [likeOp]: pattern } },
      limit: 10,
      order: [["title", "ASC"]],
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error };
  }
};

export default { getBooks, searchBooks };
