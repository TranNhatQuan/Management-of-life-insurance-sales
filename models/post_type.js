'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post_type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      Post_type.hasMany(models.Post, {
        foreignKey: "idPost_type",
      });
    }
  }
  Post_type.init({
    idPost_type: {
      allowNull: false,

      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },

    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    info: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isDel: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Post_type',
    timestamps: false,
  });
  return Post_type;
};