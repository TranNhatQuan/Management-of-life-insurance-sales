'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payment_schedules', {
      idPayment_schedule: {
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
        allowNull: true,
        references: { model: "Staffs", key: "idStaff" },
        type: Sequelize.INTEGER
      },
      idDetail_contract: {
        allowNull: false,
        references: { model: "Detail_contracts", key: "idDetail_contract" },
        type: Sequelize.INTEGER,
      },
      startDate:{
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      endDate:{
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      date:{
        allowNull: true,
        type: Sequelize.DATEONLY
      },
      status:{
        allowNull:false,
        type: Sequelize.INTEGER,
      },
      total:{
        allowNull:false,
        type: Sequelize.INTEGER,
      },
      index:{
        allowNull:false,
        type: Sequelize.INTEGER
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payment_schedules');
  }
};