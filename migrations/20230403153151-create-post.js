'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      idPost: {
        allowNull: false,
        
        primaryKey: true,
        autoIncrement: true,
        
        type: Sequelize.INTEGER
      },
      createdAt: {
        type: Sequelize.DATEONLY,
        
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATEONLY,
        
        allowNull: false,
      },
      isDel: {
        type: Sequelize.BOOLEAN,
        
        allowNull: false,
      },
      title:{
        allowNull:false,
        type: Sequelize.STRING(70),
      },
      content:{
        allowNull:false,
        type: Sequelize.TEXT,
      },
      idStaff: {
        allowNull: false,
        references: { model: "Staffs", key: "idStaff" },
        type: Sequelize.INTEGER
      },
      idPost_type: {
        allowNull: false,
        references: { model: "Post_types", key: "idPost_type" },
        type: Sequelize.INTEGER,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts');
  }
};