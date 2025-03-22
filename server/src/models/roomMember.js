const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoomMember = sequelize.define('RoomMember', {
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
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    },
    role: {
      type: DataTypes.ENUM('member', 'moderator'),
      defaultValue: 'member'
    },
    invited_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'room_members',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['room_id'] },
      { fields: ['status'] }
    ]
  });

  return RoomMember;
};