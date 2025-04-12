const { BotConfig, User } = require('../../models');

async function seedBotConfigs(users) {
  const configCount = await BotConfig.count();
  if (configCount > 0) {
    console.log('Bảng bot_configs đã có dữ liệu, bỏ qua...');
    return;
  }

  console.log('Tạo dữ liệu mẫu cho bảng bot_configs...');

  // Get system bot user
  const systemBot = await User.findOne({
    where: { username: 'system' }
  });

  if (!systemBot) {
    console.error('Không tìm thấy bot hệ thống');
    return;
  }

  await BotConfig.create({
    is_active: true,
    response_delay: 1000,
    response_mode: 'typing',
    typing_duration: 2000,
    created_by: systemBot.id
  });
}

module.exports = seedBotConfigs;