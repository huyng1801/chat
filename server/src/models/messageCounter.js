const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  const MessageCounter = sequelize.define('MessageCounter', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'chat_rooms',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    total_messages: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    unread_messages: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_read_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'message_counters',
    indexes: [
      { fields: ['room_id', 'user_id'], unique: true, where: { room_id: { [Op.ne]: null } } },
      { fields: ['user_id', 'sender_id'], unique: true, where: { sender_id: { [Op.ne]: null } } },
      { fields: ['last_read_at'] }
    ]
  });

  return MessageCounter;
};