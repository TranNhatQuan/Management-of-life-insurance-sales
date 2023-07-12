'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Contracts', {
      idContract: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      pdf: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      status: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      signDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      idUser: {
        allowNull: false,
        references: { model: "Users", key: "idUser" },
        type: Sequelize.INTEGER
      },
      idStaff: {
        allowNull: false,
        references: { model: "Staffs", key: "idStaff" },
        type: Sequelize.INTEGER
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Contracts');
  }
};