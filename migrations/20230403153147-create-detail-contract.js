'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Detail_contracts', {
      idDetail_contract: {
        allowNull: false,
        primaryKey: true,
        autoIncrement:true,
        type: Sequelize.INTEGER
      },
      idInsurance: {
        allowNull: false,
        
        references: { model: "Insurances", key: "idInsurance" },
        type: Sequelize.INTEGER
      },
      idContract: {
        allowNull: false,
        references: { model: "Contracts", key: "idContract" },
        type: Sequelize.INTEGER,
      },
      idBeneficiary: {
        allowNull: true,
        references: { model: "Users", key: "idUser" },
        type: Sequelize.INTEGER,
      },
      isMain:{
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      startDate:{
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      endDate:{
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      status:{
        allowNull: false,
        type: Sequelize.INTEGER
      },
      premium: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      premiumPaymentTerm: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      frequency: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      insuranceAmount: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      contractTerm: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Detail_contracts');
  }
};