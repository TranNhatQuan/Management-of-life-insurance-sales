'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sub_insurances', {
      idMainInsurance: {
        allowNull: false,
        
        primaryKey: true,
        references: { model: "Insurances", key: "idInsurance" },
        type: Sequelize.INTEGER
      },
      idSubInsurance: {
        allowNull: false,
        
        primaryKey: true,
        references: { model: "Insurances", key: "idInsurance" },
        type: Sequelize.INTEGER
      },
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sub_insurances');
  }
};