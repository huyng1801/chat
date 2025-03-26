const { User } = require('../../models');
const { hashPassword } = require('../../utils/bcrypt');

async function seedSystemBot() {
  const botExists = await User.findOne({
    where: { username: 'system' }
  });

  if (botExists) {
    console.log('Bot hệ thống đã tồn tại, bỏ qua...');
    return botExists;
  }

  console.log('Đang tạo tài khoản bot hệ thống...');
  const password = await hashPassword(Math.random().toString(36));
  
  return await User.create({
    email: 'system@chat.com',
    password_hash: password,
    username: 'system',
    display_name: 'Bot Hệ Thống',
    role: 'system',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=system',
    is_active: true
  });
}

module.exports = seedSystemBot;