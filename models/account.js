'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Account.hasOne(models.User,{
        foreignKey: "idAccount",
       
      })
      Account.hasOne(models.Staff,{
        foreignKey: "idAccount",
       
      })
      // define association here
    }
  }
  Account.init({
    idAccount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false, 
      unique: true, 
      
    },
    password: { type: DataTypes.STRING, allowNull: false },
    forgot: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Account',
    timestamps: false,
  });
  return Account;
};