'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.belongsTo(models.Staff, {
        foreignKey: "idStaff",
      });
      Post.belongsTo(models.Post_type, {
        foreignKey: "idPost_type",
      });
      // define association here
    }
  }
  Post.init({
    idPost: {
      allowNull: false,
      
      primaryKey: true,
      autoIncrement: true,
      
      type: DataTypes.INTEGER
    },
    createdAt: {
      type: DataTypes.DATEONLY,
      
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATEONLY,
      
      allowNull: false,
    },
    isDel: {
      type: DataTypes.BOOLEAN,
      
      allowNull: false,
    },
    title:{
      allowNull:false,
      type: DataTypes.STRING(70),
    },
    content:{
      allowNull:false,
      type: DataTypes.TEXT,
    },
  
    
  }, {
    sequelize,
    modelName: 'Post',
    timestamps: false,
  });
  return Post;
};