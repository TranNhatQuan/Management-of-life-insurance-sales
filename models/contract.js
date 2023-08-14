'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Contract.belongsTo(models.Staff,{
        foreignKey: "idStaff",
      });
      Contract.belongsTo(models.User, {
        foreignKey: "idUser",
      })
      Contract.hasMany(models.Detail_contract,{
        foreignKey: "idContract",
      });
      
      
    }
  }
  Contract.init({
    idContract: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    pdf: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    status: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    premiumPaymentTerm: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    frequency: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    
  }, {
    sequelize,
    modelName: 'Contract',
    timestamps: false,
  });
  return Contract;
};