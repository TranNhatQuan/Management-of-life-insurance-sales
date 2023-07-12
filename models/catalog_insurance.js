'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Catalog_insurance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      Catalog_insurance.belongsTo(models.Catalog, {
        foreignKey: "idCatalog",
      })
      Catalog_insurance.belongsTo(models.Insurance, {
        foreignKey: "idInsurance",
      })
    }
  }
  Catalog_insurance.init({
    idCatalog: {
      allowNull: false,
      
      primaryKey: true,
      references: { model: "Catalog", key: "idCatalog" },
      type: DataTypes.INTEGER
    },
    idInsurance: {
      allowNull: false,
      
      primaryKey: true,
      references: { model: "Insurance", key: "idInsurance" },
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'Catalog_insurance',
    timestamps: false,
  });
  return Catalog_insurance;
};