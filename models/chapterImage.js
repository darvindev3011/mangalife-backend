const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChapterImage = sequelize.define('ChapterImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cId: DataTypes.INTEGER,
    bookKey: DataTypes.STRING,
    chapterNo: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    isDownloaded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
    tableName: 'chapter_images',
  });
  return ChapterImage;
};
