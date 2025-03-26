const { sequelize, User, ChatRoom, RoomMessage, RoomMember, RoomBan, DirectMessage, Setting, ForbiddenWord } = require('../models');
const seed = require('./seed');

async function checkAndSeedDatabase() {
  try {
    // Check each table for existing data
    const tables = {
      users: await User.count(),
      chatRooms: await ChatRoom.count(),
      roomMessages: await RoomMessage.count(),
      roomMembers: await RoomMember.count(),
      roomBans: await RoomBan.count(),
      directMessages: await DirectMessage.count(),
      settings: await Setting.count(),
      forbiddenWords: await ForbiddenWord.count()
    };

    console.log('\nKiểm tra dữ liệu hiện có:');
    Object.entries(tables).forEach(([table, count]) => {
      console.log(`- ${table}: ${count} bản ghi`);
    });

    // If any table is empty, perform seeding
    const hasEmptyTables = Object.values(tables).some(count => count === 0);
    
    if (hasEmptyTables) {
      console.log('\nPhát hiện bảng trống, bắt đầu tạo dữ liệu mẫu...');
      await seed();
      
      // Verify seeding results
      const verifyTables = {
        users: await User.count(),
        chatRooms: await ChatRoom.count(),
        roomMessages: await RoomMessage.count(),
        roomMembers: await RoomMember.count(),
        roomBans: await RoomBan.count(),
        directMessages: await DirectMessage.count(),
        settings: await Setting.count(),
        forbiddenWords: await ForbiddenWord.count()
      };

      console.log('\nKết quả tạo dữ liệu mẫu:');
      Object.entries(verifyTables).forEach(([table, count]) => {
        console.log(`- ${table}: ${count} bản ghi`);
      });
    } else {
      console.log('\nTất cả các bảng đã có dữ liệu, bỏ qua bước tạo dữ liệu mẫu.');
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi kiểm tra và tạo dữ liệu mẫu:', error);
    throw error;
  }
}

async function syncDatabase() {
  try {
    console.log('Bắt đầu đồng bộ hóa cơ sở dữ liệu...');
    
    // Force sync to recreate all tables
    await sequelize.sync({ force: true });
    console.log('Đồng bộ hóa cơ sở dữ liệu hoàn tất!');

    // Check and seed database if needed
    await checkAndSeedDatabase();

    process.exit(0);
  } catch (error) {
    console.error('Lỗi đồng bộ hóa cơ sở dữ liệu:', error);
    process.exit(1);
  }
}

syncDatabase();