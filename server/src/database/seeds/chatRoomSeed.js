const { ChatRoom } = require('../../models');

async function seedChatRooms(users) {
  const roomCount = await ChatRoom.count();
  if (roomCount > 0) {
    console.log('Bảng chat_rooms đã có dữ liệu, bỏ qua...');
    return await ChatRoom.findAll();
  }

  console.log('Tạo dữ liệu mẫu cho bảng chat_rooms...');
  return await ChatRoom.bulkCreate([
    {
      name: 'Phòng Chat Chung',
      description: 'Phòng chat chung cho tất cả mọi người',
      created_by: users[0].id
    },
    {
      name: 'Hỗ Trợ Kỹ Thuật',
      description: 'Phòng hỗ trợ các vấn đề kỹ thuật',
      created_by: users[1].id
    },
    {
      name: 'Thảo Luận',
      description: 'Phòng thảo luận chung',
      created_by: users[2].id
    },
    {
      name: 'Giải Trí',
      description: 'Phòng trò chuyện, giải trí',
      created_by: users[3].id
    }
  ]);
}

module.exports = seedChatRooms;