const createAuthService = require('../services/authService');
const createUserService = require('../services/userService');

const authService = createAuthService();
const userService = createUserService();

async function register(req, res) {
  try {
    const { email, password, username, displayName } = req.body;
    // Register always creates a regular user
    const user = await userService.createUser(email, password, username, displayName, 'user');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

async function logout(req, res) {
  try {
    await authService.logout(req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    if (!user.is_active) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { currentPassword, newPassword, username, displayName, avatar } = req.body;
    const updatedUser = await authService.updateProfile(req.user.id, {
      currentPassword,
      newPassword,
      username,
      displayName,
      avatar
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile
};