const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ForbiddenWord = sequelize.define('ForbiddenWord', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chat_rooms',
        key: 'id'
      }
    },
    word: {
      type: DataTypes.STRING,
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM('censor', 'block'),
      defaultValue: 'censor',
      allowNull: false
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'forbidden_words',
    indexes: [
      { fields: ['room_id', 'word'], unique: true },
      { fields: ['created_by'] }
    ]
  });

  return ForbiddenWord;
};