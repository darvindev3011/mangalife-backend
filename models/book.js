const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bookKey: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    bookUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: true, // adds createdAt and updatedAt
    tableName: 'books',
  });
  return Book;
};
