const { Sequelize } = require('sequelize');
require('dotenv').config();

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

const Book = require('./book')(sequelize);
const BookDetail = require('./bookDetail')(sequelize);
const Chapter = require('./chapter')(sequelize);
const ChapterImage = require('./chapterImage')(sequelize);
const Genre = require('./genre')(sequelize);

// Associations
Book.hasOne(BookDetail, { foreignKey: 'bookKey', sourceKey: 'bookKey', as: 'bookDetail' });
BookDetail.belongsTo(Book, { foreignKey: 'bookKey', targetKey: 'bookKey', as: 'book' });

module.exports = {
  sequelize,
  Book,
  BookDetail,
  Chapter,
  ChapterImage,
  Genre
};
