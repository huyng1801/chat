const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Announcement = sequelize.define('Announcement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: true, // null means broadcast to all rooms
      references: {
        model: 'chat_rooms',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    schedule: {
      type: DataTypes.STRING, // Cron expression
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    last_run: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'announcements',
    indexes: [
      { fields: ['room_id'] },
      { fields: ['is_active'] },
      { fields: ['schedule'] }
    ]
  });

  return Announcement;
};