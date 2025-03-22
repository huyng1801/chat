const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoomBan = sequelize.define('RoomBan', {
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chat_rooms',
        key: 'id'
      },
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      primaryKey: true
    },
    banned_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reason: {
      type: DataTypes.TEXT
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'room_bans',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['room_id'] },
      { fields: ['expires_at'] }
    ]
  });

  return RoomBan;
};