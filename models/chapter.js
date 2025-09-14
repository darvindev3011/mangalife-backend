import { DataTypes } from 'sequelize';

export default function(sequelize) {
  const Chapter = sequelize.define('Chapter', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bookKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chapterNo: DataTypes.STRING,
    chapterUrl: DataTypes.STRING,
    chapterDate: DataTypes.STRING,
  }, {
    timestamps: true,
    tableName: 'chapters',
  });
  return Chapter;
}
