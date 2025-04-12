const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BotConfig = sequelize.define('BotConfig', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: true, // null means global config
      references: {
        model: 'chat_rooms',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    response_delay: {
      type: DataTypes.INTEGER,
      defaultValue: 1000, // Delay in milliseconds
      comment: 'Delay before bot sends response'
    },
    response_mode: {
      type: DataTypes.ENUM('instant', 'typing', 'random'),
      defaultValue: 'typing'
    },
    typing_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 2000, // Duration in milliseconds
      comment: 'How long bot appears to be typing'
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
    tableName: 'bot_configs',
    indexes: [
      { fields: ['room_id'] },
      { fields: ['is_active'] }
    ]
  });

  return BotConfig;
};