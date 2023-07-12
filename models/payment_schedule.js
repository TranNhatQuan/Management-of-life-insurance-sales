'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment_schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payment_schedule.belongsTo(models.Contract,{
        foreignKey: "idContract",
      });
      Payment_schedule.belongsTo(models.Staff, {
        foreignKey: "idStaff",
      })
      Payment_schedule.belongsTo(models.User, {
        foreignKey: "idUser",
      })
    }
  }
  Payment_schedule.init({
    idPayment_schedule: {
      allowNull: false,
      
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    startDate:{
      allowNull: false,
      type: DataTypes.DATEONLY
    },
    endDate:{
      allowNull: false,
      type: DataTypes.DATEONLY
    },
    date:{
      allowNull: true,
      type: DataTypes.DATEONLY
    },
    status:{
      allowNull:false,
      type: DataTypes.INTEGER,
    },
    total:{
      allowNull:false,
      type: DataTypes.INTEGER,
    },
   
    
  }, {
    sequelize,
    modelName: 'Payment_schedule',
    timestamps: false,
  });
  return Payment_schedule;
};