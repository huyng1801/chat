const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    display_name: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.ENUM('owner', 'admin', 'moderator', 'user'),
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM('online', 'offline'),
      defaultValue: 'offline'
    },
    avatar: {
      type: DataTypes.STRING
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['is_active'] }
    ]
  });

  return User;
};