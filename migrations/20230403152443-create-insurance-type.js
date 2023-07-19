'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Insurance_types', {
      idInsurance_type: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      info: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isDel: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Insurance_types');
  }
};