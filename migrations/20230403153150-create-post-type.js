'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Post_types', {
      idPost_type: {
        allowNull: false,

        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },

      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      info: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isDel: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }

    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Post_types');
  }
};