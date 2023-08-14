'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Staff.belongsTo(models.Account, {
        foreignKey: "idAccount",

      });
      Staff.hasMany(models.Staff_permission, {
        foreignKey: "idStaff",
      });
      Staff.hasMany(models.Insurance, {
        foreignKey: "idStaff",
      });
      Staff.hasMany(models.Payment_schedule, {
        foreignKey: "idStaff",
      });
      Staff.hasMany(models.Contract, {
        foreignKey: "idStaff",
      });
      Staff.hasMany(models.Benefit_history, {
        foreignKey: "idStaff",
      });
      Staff.hasMany(models.Post, {
        foreignKey: "idStaff",
      });

    }
  }
  Staff.init({
    idStaff: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    mail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(13),
      allowNull: false,
      unique: true,
    },
    isActive: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
  },
    {
      sequelize,
      modelName: 'Staff',
      timestamps: false,
    });
  return Staff;
};