const { User } = require('../../models');
const { hashPassword } = require('../../utils/bcrypt');

async function seedUsers() {
  const userCount = await User.count();
  if (userCount > 0) {
    console.log('Bảng users đã có dữ liệu, bỏ qua...');
    return await User.findAll();
  }

  console.log('Tạo dữ liệu mẫu cho bảng users...');
  const defaultPassword = await hashPassword('123456');
  
  return await User.bulkCreate([
    {
      email: 'owner@example.com',
      password_hash: defaultPassword,
      username: 'owner',
      display_name: 'Chủ sở hữu',
      role: 'owner',
      status: 'online',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner'
    },
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

module.exports = seedUsers;