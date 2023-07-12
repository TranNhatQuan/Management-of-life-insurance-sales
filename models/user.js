'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Account,{
        foreignKey: "idAccount",
        
      });
      
    
      User.hasMany(models.Contract,{
        foreignKey: "idUser",
      });
      User.hasMany(models.Detail_contract,{
        foreignKey: "idBeneficiary",
      });
      User.hasMany(models.Benefit_history,{
        foreignKey: "idUser",
      });
      User.hasMany(models.Payment_schedule,{
        foreignKey: "idUser",
      });
    }
  }
  User.init({
    idUser: {
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
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idCard:{
      type: DataTypes.STRING(15),
      allowNull:false,
      unique: true,
    },
    isActive: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    
   
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: false,
  });
  return User;
};