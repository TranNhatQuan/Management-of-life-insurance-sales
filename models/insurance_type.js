'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Insurance_type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      Insurance_type.hasMany(models.Insurance,{
        foreignKey: "idInsurance_type",
      });
      
      
    }
  }
  Insurance_type.init({
    idInsurance_type: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    info: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    isDel: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
  }, {
    sequelize,
    modelName: 'Insurance_type',
    timestamps: false,
  });
  return Insurance_type;
};