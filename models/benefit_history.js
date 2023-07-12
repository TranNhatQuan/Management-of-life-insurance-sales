'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Benefit_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      Benefit_history.belongsTo(models.Detail_contract, {
        foreignKey: "idDetail_contract",
      })
      Benefit_history.belongsTo(models.User, {
        foreignKey: "idUser",
      })
      Benefit_history.belongsTo(models.Staff, {
        foreignKey: "idStaff",
      })
    }
  }
  Benefit_history.init({
    idBenefit_history: {
      allowNull: false,
      
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    date:{
      allowNull: false,
      type: DataTypes.DATEONLY
    },
    info:{
      allowNull: false,
      type: DataTypes.TEXT
    },
    reason:{
      allowNull: false,
      type: DataTypes.TEXT
    },
    total:{
      allowNull: false,
      type: DataTypes.INTEGER
    },
    status:{
      allowNull: false,
      type: DataTypes.INTEGER
    },

  }, {
    sequelize,
    modelName: 'Benefit_history',
    timestamps: false,
  });
  return Benefit_history;
};