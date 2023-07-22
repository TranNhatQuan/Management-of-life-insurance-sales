'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Detail_contract extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Detail_contract.belongsTo(models.Contract, {
        foreignKey: "idContract",
      });
      Detail_contract.belongsTo(models.Insurance, {
        foreignKey: "idInsurance",
      });
      Detail_contract.belongsTo(models.User, {
        foreignKey: "idBeneficiary",
        targetKey:"idUser"
      });
      Detail_contract.hasMany(models.Benefit_history,{
        foreignKey: "idDetail_contract",
      });
      Detail_contract.hasMany(models.Payment_schedule,{
        foreignKey: "idDetail_contract",
      });
    }
  }
  Detail_contract.init({
    idDetail_contract: {
      allowNull: false,
      primaryKey: true,
      autoIncrement:true,
      type: DataTypes.INTEGER
    },
    
    isMain:{
      allowNull: false,
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
    status:{
      allowNull: false,
      type: DataTypes.INTEGER
    },
    premium: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    premiumPaymentTerm: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    frequency: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    insuranceAmount: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    contractTerm: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'Detail_contract',
    timestamps: false,
  });
  return Detail_contract;
};