'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sub_insurance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Sub_insurance.belongsTo(models.Insurance, {
        foreignKey: "idMainInsurance",
        targetKey: "idInsurance",
        as: 'mainInsurance'
      })
      Sub_insurance.belongsTo(models.Insurance, {
        foreignKey: "idSubInsurance",
        targetKey: "idInsurance",
        as: 'subInsurance'
      })
    }
  }
  Sub_insurance.init({
    idMainInsurance: {
      allowNull: false,

      primaryKey: true,
      references: { model: "Insurance", key: "idInsurance" },
      type: DataTypes.INTEGER
    },
    idSubInsurance: {
      allowNull: false,

      primaryKey: true,
      references: { model: "Insurance", key: "idInsurance" },
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'Sub_insurance',
    timestamps: false,
  });
  return Sub_insurance;
};