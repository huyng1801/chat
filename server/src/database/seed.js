const seedUsers = require('./seeds/userSeed');
const seedSystemBot = require('./seeds/systemBotSeed');
const seedChatRooms = require('./seeds/chatRoomSeed');
const seedRoomMembers = require('./seeds/roomMemberSeed');
const seedRoomMessages = require('./seeds/roomMessageSeed');
const seedDirectMessages = require('./seeds/directMessageSeed');
const seedRoomBans = require('./seeds/roomBanSeed');
const seedSettings = require('./seeds/settingSeed');
const seedForbiddenWords = require('./seeds/forbiddenWordSeed');

async function seed() {
  try {
    // Seed data in order of dependencies
    const users = await seedUsers();
    await seedSystemBot();
    const rooms = await seedChatRooms(users);
    await seedRoomMembers(users, rooms);
    await seedRoomMessages(users, rooms);
    await seedDirectMessages(users);
    await seedRoomBans(users, rooms);
    await seedSettings(users);
    await seedForbiddenWords(users, rooms);

    console.log('Hoàn thành tạo dữ liệu mẫu!');
    return true;
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error);
    throw error;
  }
}

module.exports = seed;