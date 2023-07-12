'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Screen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      Screen.hasMany(models.Staff_permission,{
        foreignKey: "idScreen",
      });
    }
  }
  Screen.init({
    idScreen: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    info: {
      allowNull: false,
      unique: true,
      type: DataTypes.TEXT,
    },
    
    
    
  }, {
    sequelize,
    modelName: 'Screen',
    timestamps: false,
  });
  return Screen;
};