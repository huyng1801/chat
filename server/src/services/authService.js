const { User } = require('../models');
const { comparePasswords, hashPassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/token');
const { sendEmail } = require('../utils/email');

function createAuthService() {
  async function validateEmail(email) {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email không hợp lệ');
    }

    return true;
  }

  async function validateUsername(username, role) {
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('Tên đăng nhập đã được sử dụng');
    }

    // Check length
    if (username.length < 3) {
      throw new Error('Tên đăng nhập phải có ít nhất 3 ký tự');
    }

    // Check for special characters
    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialCharsRegex.test(username)) {
      throw new Error('Tên đăng nhập không được chứa ký tự đặc biệt');
    }

    // For regular users, check additional restrictions
    if (role === 'user') {
      // Check for admin-related words
      const restrictedWords = ['admin', 'administrator', 'quanly', 'quản lý', 'mod', 'moderator'];
      const lowerUsername = username.toLowerCase();
      
      for (const word of restrictedWords) {
        if (lowerUsername.includes(word)) {
          throw new Error('Tên đăng nhập không được chứa từ khóa quản trị');
        }
      }
    }

    return true;
  }

  async function validateDisplayName(displayName, username) {
    // Check length
    if (displayName.length < 2) {
      throw new Error('Tên hiển thị phải có ít nhất 2 ký tự');
    }

    const lowerUsername = username.toLowerCase().trim();
    const lowerDisplayName = displayName.toLowerCase().trim();
  
    // Check for special characters
    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialCharsRegex.test(lowerDisplayName)) {
      throw new Error('Tên hiển thị không được chứa ký tự đặc biệt');
    }
  
    // Check if exactly same as username
    if (lowerDisplayName === lowerUsername) {
      throw new Error('Tên hiển thị không được giống tên đăng nhập');
    }
  
    // Check if contains username
    if (lowerDisplayName.includes(lowerUsername)) {
      throw new Error('Tên hiển thị không được chứa tên đăng nhập');
    }
  
    // Check for admin-related words
    const restrictedWords = ['admin', 'administrator', 'quanly', 'quản lý', 'mod', 'moderator'];
    for (const word of restrictedWords) {
      if (lowerDisplayName.includes(word)) {
        throw new Error('Tên hiển thị không được chứa từ khóa quản trị');
      }
    }
  
    return true;
  }

  async function validatePassword(password) {
    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      throw new Error('Mật khẩu phải chứa ít nhất 1 số');
    }

    // Check for at least one letter
    if (!/[a-zA-Z]/.test(password)) {
      throw new Error('Mật khẩu phải chứa ít nhất 1 chữ cái');
    }

    return true;
  }

  async function register(email, password, username, displayName) {
    try {
      // Validate all fields
      await validateEmail(email);
      await validateUsername(username, 'user');
      await validateDisplayName(displayName || username, username);
      await validatePassword(password);

      // Create user
      const passwordHash = await hashPassword(password);
      const user = await User.create({
        email,
        password_hash: passwordHash,
        username,
        display_name: displayName || username,
        role: 'user',
        status: 'offline',
        is_active: true
      });

      // Return user without password hash
      const { password_hash: _, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
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

    await userWithPassword.update({ status: 'online' });

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

    // Validate username if it's being updated
    if (profileData.username && profileData.username !== user.username) {
      await validateUsername(profileData.username, user.role);
    }

    // Validate display name
    if (profileData.displayName) {
      await validateDisplayName(profileData.displayName, profileData.username || user.username);
    }

    // Update profile fields
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

  async function changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    if (!user.is_active) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    const validPassword = await comparePasswords(currentPassword, user.password_hash);
    if (!validPassword) {
      throw new Error('Mật khẩu hiện tại không chính xác');
    }

    await validatePassword(newPassword);
    const newPasswordHash = await hashPassword(newPassword);
    await user.update({ password_hash: newPasswordHash });

    return true;
  }

  async function forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Email không tồn tại trong hệ thống');
    }

    if (!user.is_active) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hashPassword(tempPassword);

    // Update user's password
    await user.update({ password_hash: passwordHash });

    // Send email with temporary password
    try {
      await sendEmail('forgotPassword', [user, tempPassword]);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
    }
  }

  return {
    register,
    login,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
    forgotPassword
  };
}

module.exports = createAuthService;