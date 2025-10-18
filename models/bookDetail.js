import { DataTypes } from 'sequelize';

export default function(sequelize) {
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
    status: DataTypes.INTEGER, // 1: ongoing, 2: completed, 3: onhold, 4: cancelled, 5: upcoming
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 10
      }
    },
    latestChapter: DataTypes.STRING
  }, {
    timestamps: true,
    tableName: 'bookDetails',
  });
  return BookDetail;
}
