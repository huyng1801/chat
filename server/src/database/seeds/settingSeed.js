const { Setting } = require('../../models');

async function seedSettings(users) {
  const settingCount = await Setting.count();
  if (settingCount > 0) {
    console.log('Bảng settings đã có dữ liệu, bỏ qua...');
    return;
  }

  console.log('Tạo dữ liệu mẫu cho bảng settings...');
  await Setting.bulkCreate([
    {
      key: 'enable_private_chat',
      value: 'true',
      description: 'Cho phép người dùng nhắn tin riêng tư',
      created_by: users[0].id // Owner creates initial settings
    }
  ]);
}

module.exports = seedSettings;