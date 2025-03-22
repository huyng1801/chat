const createUserService = require('../services/userService');
const userService = createUserService();

async function getUsers(req, res) {
  try {
    const { 
      page,
      limit,
      search,
      role,
      status,
      isActive,
      sortBy,
      sortOrder
    } = req.query;

    const result = await userService.getAllUsers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || '',
      role: role || '',
      status: status || '',
      isActive: isActive === undefined ? null : isActive === 'true',
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'desc'
    });

    res.json(result);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getChatUsers(req, res) {
  try {
    const { status } = req.query;
    const currentUserId = req.user.id;

    const users = await userService.getChatUsers({
      currentUserId,
      status: status || '',
      excludeAdmin: true
    });

    res.json({ users });
  } catch (error) {
    console.error('Error in getChatUsers:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getUser(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    const { password_hash, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function createUser(req, res) {
  try {
    const { email, password, username, displayName, role, avatar } = req.body;
    const user = await userService.createUser(email, password, username, displayName, role, avatar);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateUser(req, res) {
  try {
    await userService.updateUser(req.params.id, req.body);
    const user = await userService.getUserById(req.params.id);
    const { password_hash, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateAvatar(req, res) {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }
    
    await userService.updateAvatar(req.params.id, avatar);
    const user = await userService.getUserById(req.params.id);
    const { password_hash, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'Mật khẩu mới là bắt buộc' });
    }

    await userService.resetPassword(req.params.id, newPassword);
    res.json({ success: true, message: 'Mật khẩu đã được đặt lại' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getUsers,
  getChatUsers,
  getUser,
  createUser,
  updateUser,
  updateAvatar,
  deleteUser,
  resetPassword
};