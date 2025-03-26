const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config);

// Import models
const User = require('./user')(sequelize);
const ChatRoom = require('./chatRoom')(sequelize);
const RoomMember = require('./roomMember')(sequelize);
const RoomBan = require('./roomBan')(sequelize);
const RoomMessage = require('./roomMessage')(sequelize);
const DirectMessage = require('./directMessage')(sequelize);
const MessageCounter = require('./messageCounter')(sequelize);
const ForbiddenWord = require('./forbiddenWord')(sequelize);
const Announcement = require('./announcement')(sequelize);
const Setting = require('./setting')(sequelize);

// Define associations
User.hasMany(RoomMessage, { foreignKey: 'sender_id', as: 'messages' });
RoomMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

User.hasMany(DirectMessage, { foreignKey: 'sender_id', as: 'sentDirectMessages' });
User.hasMany(DirectMessage, { foreignKey: 'receiver_id', as: 'receivedDirectMessages' });
DirectMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
DirectMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

User.hasMany(ChatRoom, { foreignKey: 'created_by', as: 'createdRooms' });
ChatRoom.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

ChatRoom.hasMany(RoomMessage, { foreignKey: 'room_id', as: 'messages' });
RoomMessage.belongsTo(ChatRoom, { foreignKey: 'room_id', as: 'room' });

// Message counter associations
User.hasMany(MessageCounter, { foreignKey: 'user_id', as: 'messageCounters' });
MessageCounter.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

ChatRoom.hasMany(MessageCounter, { foreignKey: 'room_id', as: 'messageCounters' });
MessageCounter.belongsTo(ChatRoom, { foreignKey: 'room_id', as: 'room' });

User.hasMany(MessageCounter, { foreignKey: 'sender_id', as: 'sentMessageCounters' });
MessageCounter.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Forbidden words associations
User.hasMany(ForbiddenWord, { foreignKey: 'created_by', as: 'createdForbiddenWords' });
ForbiddenWord.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Announcement associations
User.hasMany(Announcement, { foreignKey: 'created_by', as: 'createdAnnouncements' });
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

ChatRoom.hasMany(Announcement, { foreignKey: 'room_id', as: 'announcements' });
Announcement.belongsTo(ChatRoom, { foreignKey: 'room_id', as: 'room' });

// Settings associations
User.hasMany(Setting, { foreignKey: 'created_by', as: 'createdSettings' });
Setting.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

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

// Add direct associations for RoomMember
ChatRoom.hasMany(RoomMember, { foreignKey: 'room_id', as: 'RoomMembers' });
RoomMember.belongsTo(ChatRoom, { foreignKey: 'room_id' });
User.hasMany(RoomMember, { foreignKey: 'user_id' });
RoomMember.belongsTo(User, { foreignKey: 'user_id' });

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

module.exports = {
  sequelize,
  User,
  ChatRoom,
  RoomMember,
  RoomBan,
  RoomMessage,
  DirectMessage,
  MessageCounter,
  ForbiddenWord,
  Announcement,
  Setting
};