const { DirectMessage } = require('../../models');

async function seedDirectMessages(users) {
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

module.exports = seedDirectMessages;