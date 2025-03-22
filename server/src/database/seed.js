const { User, ChatRoom, Message, RoomMember, RoomBan, DirectMessage } = require('../models');
const { hashPassword } = require('../utils/bcrypt');

async function checkAndCreateUsers() {
  const userCount = await User.count();
  if (userCount > 0) {
    console.log('Bảng users đã có dữ liệu, bỏ qua...');
    return await User.findAll();
  }

  console.log('Tạo dữ liệu mẫu cho bảng users...');
  const defaultPassword = await hashPassword('123456');
  
  return await User.bulkCreate([
    {
      email: 'admin@example.com',
      password_hash: defaultPassword,
      username: 'admin',
      display_name: 'Quản trị viên',
      role: 'admin',
      status: 'online',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    {
      email: 'mod1@example.com',
      password_hash: defaultPassword,
      username: 'moderator1',
      display_name: 'Điều hành viên 1',
      role: 'moderator',
      status: 'online',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mod1'
    },
    {
      email: 'mod2@example.com',
      password_hash: defaultPassword,
      username: 'moderator2',
      display_name: 'Điều hành viên 2',
      role: 'moderator',
      status: 'offline',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mod2'
    },
    {
      email: 'user1@example.com',
      password_hash: defaultPassword,
      username: 'user1',
      display_name: 'Người dùng 1',
      role: 'user',
      status: 'online',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1'
    },
    {
      email: 'user2@example.com',
      password_hash: defaultPassword,
      username: 'user2',
      display_name: 'Người dùng 2',
      role: 'user',
      status: 'offline',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2'
    }
  ]);
}

async function checkAndCreateRooms(users) {
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

async function checkAndCreateRoomMembers(users, rooms) {
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
      status: 'pending',
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

async function checkAndCreateMessages(users, rooms) {
  const messageCount = await Message.count();
  if (messageCount > 0) {
    console.log('Bảng messages đã có dữ liệu, bỏ qua...');
    return;
  }

  console.log('Tạo dữ liệu mẫu cho bảng messages...');
  await Message.bulkCreate([
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

async function checkAndCreateDirectMessages(users) {
  const directMessageCount = await DirectMessage.count();
  if (directMessageCount > 0) {
    console.log('Bảng direct_messages đã có dữ liệu, bỏ qua...');
    return;
  }

  console.log('Tạo dữ liệu mẫu cho bảng direct_messages...');
  await DirectMessage.bulkCreate([
    {
      sender_id: users[0].id,
      receiver_id: users[1].id,
      content: 'Chào bạn, bạn có rảnh không?',
      type: 'text'
    },
    {
      sender_id: users[1].id,
      receiver_id: users[0].id,
      content: 'Chào admin, tôi đang online đây',
      type: 'text'
    },
    {
      sender_id: users[2].id,
      receiver_id: users[3].id,
      content: 'Hey, mình có thể trao đổi về dự án không?',
      type: 'text'
    },
    {
      sender_id: users[3].id,
      receiver_id: users[2].id,
      content: 'Được chứ, bạn cần trao đổi gì?',
      type: 'text'
    }
  ]);
}

// async function checkAndCreateRoomBans(users, rooms) {
//   const banCount = await RoomBan.count();
//   if (banCount > 0) {
//     console.log('Bảng room_bans đã có dữ liệu, bỏ qua...');
//     return;
//   }

//   console.log('Tạo dữ liệu mẫu cho bảng room_bans...');
//   await RoomBan.bulkCreate([
//     {
//       room_id: rooms[0].id,
//       user_id: users[4].id,
//       banned_by: users[0].id,
//       reason: 'Vi phạm nội quy phòng chat'
//     },
//     {
//       room_id: rooms[1].id,
//       user_id: users[3].id,
//       banned_by: users[1].id,
//       reason: 'Spam tin nhắn'
//     }
//   ]);
// }

async function seed() {
  try {
    // Check and create data for each table
    const users = await checkAndCreateUsers();
    const rooms = await checkAndCreateRooms(users);
    await checkAndCreateRoomMembers(users, rooms);
    await checkAndCreateMessages(users, rooms);
    await checkAndCreateDirectMessages(users);
    // await checkAndCreateRoomBans(users, rooms);

    console.log('Hoàn thành tạo dữ liệu mẫu!');
    return true;
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error);
    throw error;
  }
}

module.exports = seed;