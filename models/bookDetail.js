const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookDetail = sequelize.define('BookDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bookKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: DataTypes.STRING,
    bannerUrl: DataTypes.STRING,
    rank: DataTypes.STRING,
    authors: DataTypes.STRING,
    alternative: DataTypes.STRING,
    author: DataTypes.STRING,
    genres: DataTypes.STRING,
    summary: DataTypes.TEXT,
    tags: DataTypes.STRING,
  }, {
    timestamps: true,
    tableName: 'bookDetails',
  });
  return BookDetail;
};
