import { DataTypes } from "sequelize";
    
export default function (sequelize) {
    const CommentLike = sequelize.define("CommentLike", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
    }, {
      timestamps: true, // Enable automatic timestamps
      tableName: 'comment_likes',
    });
    return CommentLike;
}
