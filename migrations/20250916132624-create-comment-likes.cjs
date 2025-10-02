module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("comment_likes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      comment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "comments",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      user_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
    await queryInterface.addConstraint("comment_likes", {
      fields: ["comment_id", "user_id"],
      type: "unique",
      name: "unique_comment_like_per_user",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("comment_likes");
  },
};
