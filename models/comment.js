import { DataTypes } from "sequelize";

export default function (sequelize) {
  const Comment = sequelize.define("Comment", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    post_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "comments",
        key: "id",
      },
      onDelete: "CASCADE",
      allowNull: true,
    },
  }, {
    timestamps: true, // Enable automatic timestamps
    tableName: 'comments',
  });
  return Comment;
}