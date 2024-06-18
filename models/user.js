'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profile_picture: {
      type: DataTypes.STRING
    },
    bio: {
      type: DataTypes.STRING
    },
    user_type: {
      type: DataTypes.STRING
    }
  }, {});
  
  User.associate = function(models) {
    // associations can be defined here
  };
  
  return User;
};