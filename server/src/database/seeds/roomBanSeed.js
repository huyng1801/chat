const { RoomBan } = require('../../models');

async function seedRoomBans(users, rooms) {
  const banCount = await RoomBan.count();
  if (banCount > 0) {
    console.log('Bảng room_bans đã có dữ liệu, bỏ qua...');
    return;
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Ban for 7 days

  console.log('Tạo dữ liệu mẫu cho bảng room_bans...');
  await RoomBan.bulkCreate([
    {
      room_id: rooms[0].id,
      user_id: users[4].id,
      banned_by: users[0].id,
      reason: 'Vi phạm nội quy phòng chat',
      expires_at: expiresAt
    },
    {
      room_id: rooms[1].id,
      user_id: users[3].id,
      banned_by: users[1].id,
      reason: 'Spam tin nhắn',
      expires_at: expiresAt
    }
  ]);
}

module.exports = seedRoomBans;