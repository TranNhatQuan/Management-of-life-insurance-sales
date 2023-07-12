'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Catalog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      Catalog.hasMany(models.Catalog_insurance,{
        foreignKey: "idCatalog",
      });
    }
  }
  Catalog.init({
    idCatalog: {
      allowNull: false,
      
      primaryKey: true,
      autoIncrement:true,
      type: DataTypes.INTEGER
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    info: {
      allowNull: false,
      type: DataTypes.TEXT
    },

  }, {
    sequelize,
    modelName: 'Catalog',
    timestamps: false,
  });
  return Catalog;
};