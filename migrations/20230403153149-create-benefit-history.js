'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Benefit_histories', {

      idBenefit_history: {
        allowNull: false,

        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
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
      idDetail_contract: {
        allowNull: false,
        references: { model: "Detail_contracts", key: "idDetail_contract" },
        type: Sequelize.INTEGER,
      },
      date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      info: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      reason: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      total: {
        allowNull: false,
        type: Sequelize.INTEGER
      },

    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Benefit_histories');
  }
};