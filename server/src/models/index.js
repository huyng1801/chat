const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config);

// Import models
const User = require('./user')(sequelize);
const ChatRoom = require('./chatRoom')(sequelize);
const RoomMember = require('./roomMember')(sequelize);
const RoomBan = require('./roomBan')(sequelize);
const Message = require('./message')(sequelize);
const DirectMessage = require('./directMessage')(sequelize);

// Define associations
User.hasMany(Message, { foreignKey: 'sender_id', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

User.hasMany(DirectMessage, { foreignKey: 'sender_id', as: 'sentDirectMessages' });
User.hasMany(DirectMessage, { foreignKey: 'receiver_id', as: 'receivedDirectMessages' });
DirectMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
DirectMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

User.hasMany(ChatRoom, { foreignKey: 'created_by', as: 'createdRooms' });
ChatRoom.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

ChatRoom.hasMany(Message, { foreignKey: 'room_id', as: 'messages' });
Message.belongsTo(ChatRoom, { foreignKey: 'room_id', as: 'room' });

// Many-to-Many: Users <-> ChatRooms through RoomMembers
User.belongsToMany(ChatRoom, { 
  through: RoomMember,
  foreignKey: 'user_id',
  as: 'rooms'
});
ChatRoom.belongsToMany(User, { 
  through: RoomMember,
  foreignKey: 'room_id',
  as: 'members'
});

// Many-to-Many: Users <-> ChatRooms through RoomBans
User.belongsToMany(ChatRoom, {
  through: RoomBan,
  foreignKey: 'user_id',
  as: 'bannedFromRooms'
});
ChatRoom.belongsToMany(User, {
  through: RoomBan,
  foreignKey: 'room_id',
  as: 'bannedUsers'
});

RoomMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(RoomMember, { foreignKey: 'user_id', as: 'roomMemberships' });

module.exports = {
  sequelize,
  User,
  ChatRoom,
  RoomMember,
  RoomBan,
  Message,
  DirectMessage
};