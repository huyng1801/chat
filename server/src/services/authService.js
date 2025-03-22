const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { comparePasswords, hashPassword } = require('../utils/bcrypt');

function createAuthService() {
  function generateToken(user) {
    return jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  async function login(email, password) {
    // First get user with password_hash
    const userWithPassword = await User.findOne({ 
      where: { email }
    });
    
    if (!userWithPassword) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    if (!userWithPassword.is_active) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    const validPassword = await comparePasswords(password, userWithPassword.password_hash);
    if (!validPassword) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    // Update status
    await userWithPassword.update({ status: 'online' });

    // Get user without password for response
    const user = await User.findOne({
      where: { email },
      attributes: {
        exclude: ['password_hash']
      }
    });

    const token = generateToken(user);
    
    return { user, token };
  }

  async function logout(userId) {
    await User.update(
      { status: 'offline' },
      { where: { id: userId } }
    );
    return true;
  }

  async function getCurrentUser(userId) {
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ['password_hash']
      }
    });

    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    if (!user.is_active) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    return user;
  }

  async function updateProfile(userId, profileData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    if (!user.is_active) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    // If password change is requested
    if (profileData.currentPassword) {
      const validPassword = await comparePasswords(
        profileData.currentPassword, 
        user.password_hash
      );
      
      if (!validPassword) {
        throw new Error('Mật khẩu hiện tại không chính xác');
      }

      if (profileData.newPassword) {
        const newPasswordHash = await hashPassword(profileData.newPassword);
        await user.update({ password_hash: newPasswordHash });
      }
    }

    // Update other profile fields
    const updateData = {
      username: profileData.username,
      display_name: profileData.displayName,
      avatar: profileData.avatar
    };

    await user.update(updateData);

    // Return user without password hash
    const updatedUser = await User.findByPk(userId, {
      attributes: {
        exclude: ['password_hash']
      }
    });

    return updatedUser;
  }

  return {
    generateToken,
    login,
    logout,
    getCurrentUser,
    updateProfile
  };
}

module.exports = createAuthService;