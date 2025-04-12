const { AutoReply, User } = require('../../models');

async function seedAutoReplies(users) {
  const replyCount = await AutoReply.count();
  if (replyCount > 0) {
    console.log('Bảng auto_replies đã có dữ liệu, bỏ qua...');
    return;
  }

  console.log('Tạo dữ liệu mẫu cho bảng auto_replies...');

  // Get system bot user
  const systemBot = await User.findOne({
    where: { username: 'system' }
  });

  if (!systemBot) {
    console.error('Không tìm thấy bot hệ thống');
    return;
  }

  await AutoReply.bulkCreate([
    {
      keyword: 'xin chào',
      response: 'Chào bạn! Mình có thể giúp gì cho bạn?',
      match_mode: 'contains',
      is_active: true,
      priority: 1,
      created_by: systemBot.id
    },
    {
      keyword: 'help',
      response: 'Bạn cần trợ giúp gì? Hãy cho mình biết nhé!',
      match_mode: 'exact',
      is_active: true,
      priority: 2,
      created_by: systemBot.id
    },
    {
      keyword: 'cảm ơn',
      response: 'Không có gì! Rất vui được giúp bạn.',
      match_mode: 'contains',
      is_active: true,
      priority: 1,
      created_by: systemBot.id
    }
  ]);
}

module.exports = seedAutoReplies;