import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();


import BookInit from './book.js';
import BookDetailInit from './bookDetail.js';
import ChapterInit from './chapter.js';
import ChapterImageInit from './chapterImage.js';
import GenreInit from './genre.js';
import UserInit from './user.js';
import CommentInit from './comment.js';
import CommentLikeInit from './commentLike.js';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

const Book = BookInit(sequelize);
const BookDetail = BookDetailInit(sequelize);
const Chapter = ChapterInit(sequelize);
const ChapterImage = ChapterImageInit(sequelize);
const Genre = GenreInit(sequelize);
const User = UserInit(sequelize);
const Comment = CommentInit(sequelize);
const CommentLike = CommentLikeInit(sequelize);

// Associations
Book.hasOne(BookDetail, { foreignKey: 'bookKey', sourceKey: 'bookKey', as: 'bookDetail' });
BookDetail.belongsTo(Book, { foreignKey: 'bookKey', targetKey: 'bookKey', as: 'book' });

// Comment associations
Comment.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(Comment, { as: 'comments', foreignKey: 'user_id' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parent_id' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parent_id' });
Comment.hasMany(CommentLike, { as: 'likes', foreignKey: 'comment_id' });
CommentLike.belongsTo(Comment, { as: 'comment', foreignKey: 'comment_id' });

export { sequelize, Book, BookDetail, Chapter, ChapterImage, Genre, User, Comment, CommentLike };
