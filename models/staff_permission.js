'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Staff_permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      Staff_permission.belongsTo(models.Staff, {
        foreignKey: "idStaff",
      })
      Staff_permission.belongsTo(models.Screen, {
        foreignKey: "idScreen",
      })
      Staff_permission.belongsTo(models.Permission, {
        foreignKey: "idPermission",
      })
    }
  }
  Staff_permission.init({
    idStaff: {
      allowNull: false,
      primaryKey: true,
      references: { model: "Staff", key: "idStaff" },
      type: DataTypes.INTEGER
    },
    idPermission: {
      allowNull: false,
      primaryKey: true,
      references: { model: "Permission", key: "idPermission" },
      type: DataTypes.INTEGER

    },
    idScreen: {
      allowNull: false,
      primaryKey: true,
      references: { model: "Screen", key: "idScreen" },
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'Staff_permission',
    timestamps: false,
  });
  return Staff_permission;
};