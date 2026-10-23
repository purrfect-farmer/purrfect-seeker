/**
 * @param {import("sequelize").QueryInterface} queryInterface
 * @param {typeof import("sequelize")} Sequelize
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Servers", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    key: {
      unique: true,
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
}

/** @param {import("sequelize").QueryInterface} queryInterface */
export async function down(queryInterface) {
  await queryInterface.dropTable("Servers");
}
