const { RoomMember } = require('../../models');

async function seedRoomMembers(users, rooms) {
  const memberCount = await RoomMember.count();
  if (memberCount > 0) {
    console.log('Bảng room_members đã có dữ liệu, bỏ qua...');
    return;
  }

  console.log('Tạo dữ liệu mẫu cho bảng room_members...');
  await RoomMember.bulkCreate([
    // Phòng Chat Chung
    {
      room_id: rooms[0].id,
      user_id: users[0].id,
      status: 'accepted',
      role: 'moderator'
    },
    {
      room_id: rooms[0].id,
      user_id: users[1].id,
      status: 'accepted',
      role: 'member'
    },
    {
      room_id: rooms[0].id,
      user_id: users[2].id,
      status: 'accepted',
      role: 'member'
    },
    {
      room_id: rooms[0].id,
      user_id: users[3].id,
      status: 'pending',
      role: 'member'
    },

    // Hỗ Trợ Kỹ Thuật
    {
      room_id: rooms[1].id,
      user_id: users[1].id,
      status: 'accepted',
      role: 'moderator'
    },
    {
      room_id: rooms[1].id,
      user_id: users[0].id,
      status: 'accepted',
      role: 'member'
    },
    {
      room_id: rooms[1].id,
      user_id: users[4].id,
      status: 'accepted',
      role: 'member'
    },

    // Thảo Luận
    {
      room_id: rooms[2].id,
      user_id: users[2].id,
      status: 'accepted',
      role: 'moderator'
    },
    {
      room_id: rooms[2].id,
      user_id: users[3].id,
      status: 'accepted',
      role: 'member'
    },

    // Giải Trí
    {
      room_id: rooms[3].id,
      user_id: users[3].id,
      status: 'accepted',
      role: 'moderator'
    }
  ]);
}

module.exports = seedRoomMembers;