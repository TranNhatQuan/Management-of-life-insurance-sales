'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Insurances', {
      idInsurance: {
        allowNull: false,
        
        primaryKey: true,
        autoIncrement:true,
        type: Sequelize.INTEGER
      },
      idInsurance_type: {
        allowNull: true,
        references: { model: "Insurance_types", key: "idInsurance_type" },
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      info: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      isMain: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      premium: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      premiumPaymentTerm: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      premiumTerm: {
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
      isDel: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    
  }
};