import { DataTypes } from 'sequelize';

export default function(sequelize) {
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
    imageName: DataTypes.STRING,
    isDownloaded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
    tableName: 'chapter_images',
  });
  return ChapterImage;
}
