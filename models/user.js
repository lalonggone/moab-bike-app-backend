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
      allowNull: true
    },
    profile_picture: {
      type: DataTypes.STRING
    },
    bio: {
      type: DataTypes.STRING
    },
    account_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'individual', 
      validate: {
        isIn: [['individual', 'organization']]
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'admin']]
      }
    }
  }, {});
  
  User.associate = function(models) {
    User.hasOne(models.UserProfile, { foreignKey: 'userId', as: 'profile' });
  };
  
  return User;
};