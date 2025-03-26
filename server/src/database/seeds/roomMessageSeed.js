const { RoomMessage } = require('../../models');

async function seedRoomMessages(users, rooms) {
  const messageCount = await RoomMessage.count();
  if (messageCount > 0) {
    console.log('Bảng room_messages đã có dữ liệu, bỏ qua...');
    return;
  }

  console.log('Tạo dữ liệu mẫu cho bảng room_messages...');
  await RoomMessage.bulkCreate([
    // Tin nhắn trong Phòng Chat Chung
    {
      room_id: rooms[0].id,
      sender_id: users[0].id,
      content: 'Chào mừng mọi người đến với phòng chat chung! 👋',
      type: 'text'
    },
    {
      room_id: rooms[0].id,
      sender_id: users[1].id,
      content: 'Cảm ơn admin. Rất vui được tham gia! 😊',
      type: 'text'
    },
    {
      room_id: rooms[0].id,
      sender_id: users[2].id,
      content: 'Xin chào mọi người!',
      type: 'text'
    },

    // Tin nhắn trong Hỗ Trợ Kỹ Thuật
    {
      room_id: rooms[1].id,
      sender_id: users[1].id,
      content: 'Xin chào, tôi có thể giúp gì cho bạn? 🛠️',
      type: 'text'
    },
    {
      room_id: rooms[1].id,
      sender_id: users[0].id,
      content: 'Cảm ơn, tôi cần hỗ trợ về vấn đề đăng nhập',
      type: 'text'
    },

    // Tin nhắn trong Thảo Luận
    {
      room_id: rooms[2].id,
      sender_id: users[2].id,
      content: 'Chào mọi người, hãy cùng thảo luận nhé! 💬',
      type: 'text'
    },
    {
      room_id: rooms[2].id,
      sender_id: users[3].id,
      content: 'Đề tài hôm nay là gì vậy?',
      type: 'text'
    }
  ]);
}

module.exports = seedRoomMessages;