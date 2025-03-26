const { ChatRoom, User, RoomMember, RoomMessage, sequelize } = require('../models');
const { Op } = require('sequelize');

function createChatRoomService() {
  async function createRoom(name, description, createdBy) {
    try {
      const room = await ChatRoom.create({
        name,
        description,
        created_by: createdBy
      });

      // Add creator as moderator
      await RoomMember.create({
        room_id: room.id,
        user_id: createdBy,
        status: 'accepted',
        role: 'moderator'
      });

      return getRoomById(room.id);
    } catch (error) {
      console.error('Error in createRoom:', error);
      throw error;
    }
  }

  async function getRooms({ 
    page = 1, 
    limit = 10, 
    search = '', 
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = {}) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const validSortColumns = ['created_at', 'updated_at', 'name'];
      const validSortOrders = ['asc', 'desc'];
      
      const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder : 'desc';

      const { count, rows } = await ChatRoom.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['username']
          },
          {
            model: User,
            as: 'members',
            attributes: ['id'],
            through: { where: { status: 'accepted' } }
          }
        ],
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM room_messages
                WHERE room_messages.room_id = ChatRoom.id
              )`),
              'message_count'
            ]
          ]
        },
        order: [[finalSortBy, finalSortOrder]],
        limit: limitNum,
        offset: offset,
        distinct: true
      });

      const rooms = rows.map(room => ({
        ...room.toJSON(),
        creator_name: room.creator?.username,
        member_count: room.members?.length || 0,
        message_count: parseInt(room.getDataValue('message_count')) || 0
      }));

      return {
        rooms,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      };
    } catch (error) {
      console.error('Error in getRooms:', error);
      throw error;
    }
  }

  async function getRoomById(id) {
    try {
      const room = await ChatRoom.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['username']
          },
          {
            model: User,
            as: 'members',
            attributes: ['id'],
            through: { where: { status: 'accepted' } }
          }
        ],
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM room_messages
                WHERE room_messages.room_id = ChatRoom.id
              )`),
              'message_count'
            ]
          ]
        }
      });

      if (!room) return null;

      return {
        ...room.toJSON(),
        creator_name: room.creator?.username,
        member_count: room.members?.length || 0,
        message_count: parseInt(room.getDataValue('message_count')) || 0
      };
    } catch (error) {
      console.error('Error in getRoomById:', error);
      throw error;
    }
  }

  async function updateRoom(id, name, description) {
    try {
      await ChatRoom.update(
        { name, description },
        { where: { id } }
      );
      return getRoomById(id);
    } catch (error) {
      console.error('Error in updateRoom:', error);
      throw error;
    }
  }

  async function deleteRoom(id) {
    try {
      await ChatRoom.destroy({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error in deleteRoom:', error);
      throw error;
    }
  }

  return {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
  };
}

module.exports = createChatRoomService;