const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AutoReply = sequelize.define('AutoReply', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: true, // null means global auto-reply
      references: {
        model: 'chat_rooms',
        key: 'id'
      }
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    match_mode: {
      type: DataTypes.ENUM('exact', 'contains', 'starts_with', 'ends_with', 'regex'),
      defaultValue: 'contains'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0
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
    tableName: 'auto_replies',
    indexes: [
      { fields: ['room_id'] },
      { fields: ['keyword'] },
      { fields: ['is_active'] },
      { fields: ['priority'] }
    ]
  });

  return AutoReply;
};