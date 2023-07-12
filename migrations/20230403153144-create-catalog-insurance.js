'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Catalog_insurances', {
      idCatalog: {
        allowNull: false,
        
        primaryKey: true,
        references: { model: "Catalogs", key: "idCatalog" },
        type: Sequelize.INTEGER
      },
      idInsurance: {
        allowNull: false,
        
        primaryKey: true,
        references: { model: "Insurances", key: "idInsurance" },
        type: Sequelize.INTEGER
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Catalog_insurances');
  }
};