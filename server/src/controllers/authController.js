const createAuthService = require('../services/authService');
const createUserService = require('../services/userService');

const authService = createAuthService();
const userService = createUserService();

async function register(req, res) {
  try {
    const { email, password, username, displayName } = req.body;
    // Register always creates a regular user
    const user = await authService.register(email, password, username, displayName);
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
    const { username, displayName, avatar } = req.body;
    const updatedUser = await authService.updateProfile(req.user.id, {
      username,
      displayName,
      avatar
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new Error('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới');
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new Error('Vui lòng cung cấp địa chỉ email');
    }

    await authService.forgotPassword(email);
    res.json({ 
      success: true, 
      message: 'Mật khẩu tạm thời đã được gửi đến email của bạn' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword
};