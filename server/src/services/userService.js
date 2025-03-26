const { User } = require('../models');
const { hashPassword } = require('../utils/bcrypt');
const { Op } = require('sequelize');

function createUserService() {
  async function createUser(email, password, username, displayName = username, role = 'user', avatar = null) {
    try {
      const passwordHash = await hashPassword(password);
      const user = await User.create({
        email,
        password_hash: passwordHash,
        username,
        display_name: displayName,
        role,
        avatar
      });
      
      const { password_hash, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email hoặc tên người dùng đã tồn tại');
      }
      throw error;
    }
  }

  async function getUserByEmail(email) {
    return User.findOne({ 
      where: { 
        email,
        role: { [Op.ne]: 'system' } 
      }
    });
  }

  async function getUserById(id) {
    return User.findOne({
      where: { 
        id,
        role: { [Op.ne]: 'system' }
      }
    });
  }

  async function getAllUsers({ 
    page = 1, 
    limit = 10, 
    search = '', 
    role = '', 
    status = '', 
    isActive = null,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = {}) {
    try {
      // Ensure numeric values
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      // Build where clause
      const where = {
        role: { [Op.ne]: 'system' } // Exclude system bot
      };

      if (search) {
        where[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { display_name: { [Op.like]: `%${search}%` } }
        ];
      }

      if (role) where.role = role;
      if (status) where.status = status;
      if (isActive !== null) where.is_active = isActive;

      // Validate sort parameters
      const validSortColumns = ['created_at', 'updated_at', 'username', 'email'];
      const validSortOrders = ['asc', 'desc'];
      
      const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder : 'desc';

      const { count, rows } = await User.findAndCountAll({
        where,
        order: [[finalSortBy, finalSortOrder]],
        limit: limitNum,
        offset: offset,
        attributes: { 
          exclude: ['password_hash'] 
        }
      });

      return {
        users: rows,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      };
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  async function getChatUsers({ currentUserId, status = '', excludeAdmin = false } = {}) {
    try {
      const where = {
        id: { [Op.ne]: currentUserId }, // Exclude current user
        role: { [Op.ne]: 'system' }, // Exclude system bot
        is_active: true
      };

      if (status) {
        where.status = status;
      }

      if (excludeAdmin) {
        where.role = { 
          [Op.and]: [
            { [Op.ne]: 'system' },
            { [Op.ne]: 'admin' }
          ]
        };
      }

      const users = await User.findAll({
        where,
        attributes: {
          exclude: ['password_hash', 'email']
        },
        order: [
          ['status', 'ASC'], // Online users first
          ['display_name', 'ASC']
        ]
      });

      return users;
    } catch (error) {
      console.error('Error in getChatUsers:', error);
      throw error;
    }
  }

  async function updateUserStatus(id, status) {
    return User.update(
      { status }, 
      { 
        where: { 
          id,
          role: { [Op.ne]: 'system' }
        } 
      }
    );
  }

  async function updateUser(id, userData) {
    const { email, username, displayName, role, avatar, isActive } = userData;
    return User.update({
      email,
      username,
      display_name: displayName,
      role,
      avatar,
      is_active: isActive
    }, {
      where: { 
        id,
        role: { [Op.ne]: 'system' }
      }
    });
  }

  async function updateAvatar(id, avatar) {
    return User.update(
      { avatar }, 
      { 
        where: { 
          id,
          role: { [Op.ne]: 'system' }
        } 
      }
    );
  }

  async function updateIsActive(id, isActive) {
    return User.update(
      { is_active: isActive }, 
      { 
        where: { 
          id,
          role: { [Op.ne]: 'system' }
        } 
      }
    );
  }

  async function deleteUser(id) {
    return User.destroy({ 
      where: { 
        id,
        role: { [Op.ne]: 'system' }
      } 
    });
  }

  async function resetPassword(id, newPassword) {
    const passwordHash = await hashPassword(newPassword);
    return User.update(
      { password_hash: passwordHash }, 
      { 
        where: { 
          id,
          role: { [Op.ne]: 'system' }
        } 
      }
    );
  }

  return {
    createUser,
    getUserByEmail,
    getUserById,
    getAllUsers,
    getChatUsers,
    updateUserStatus,
    updateUser,
    updateAvatar,
    updateIsActive,
    deleteUser,
    resetPassword
  };
}

module.exports = createUserService;