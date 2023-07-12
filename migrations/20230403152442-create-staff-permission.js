'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Staff_permissions', {
      idStaff: {
        allowNull: false,
        primaryKey: true,
        references: { model: "Staffs", key: "idStaff" },
        type: Sequelize.INTEGER
      },
      idPermission: {
        allowNull: false,
        primaryKey: true,
        references: { model: "Permissions", key: "idPermission" },
        type: Sequelize.INTEGER

      },
      idScreen: {
        allowNull: false,
        primaryKey: true,
        references: { model: "Screens", key: "idScreen" },
        type: Sequelize.INTEGER
      },
      

      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Staff_permissions');
  }
};