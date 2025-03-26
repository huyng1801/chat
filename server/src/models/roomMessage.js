const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoomMessage = sequelize.define('RoomMessage', {
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
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'file'),
      defaultValue: 'text'
    }
  }, {
    tableName: 'room_messages',
    indexes: [
      { fields: ['room_id'] },
      { fields: ['sender_id'] },
      { fields: ['created_at'] }
    ]
  });

  return RoomMessage;
};