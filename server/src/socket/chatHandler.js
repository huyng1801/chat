const { User, ChatRoom, Message } = require('../models');

function createChatHandler(io) {
  const connectedUsers = new Map();
  const userSockets = new Map();

  async function handleConnection(socket) {
    console.log('Người dùng kết nối:', socket.id);

    socket.on('authenticate', async (userId) => {
      try {
        // Get user from database
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

        // Store user connection
        connectedUsers.set(socket.id, userId);
        userSockets.set(userId, socket.id);
        
        // Update user status
        await user.update({ status: 'online' });
        
        // Broadcast user status to all clients
        io.emit('user_status_change', { 
          userId: user.id, 
          status: 'online' 
        });
        
        // Join user to their private room
        socket.join(`user:${userId}`);
        
        // Get user's rooms and join them
        const rooms = await ChatRoom.findAll({
          include: [{
            model: User,
            as: 'members',
            where: { id: userId },
            through: { where: { status: 'accepted' } }
          }]
        });

        rooms.forEach(room => {
          socket.join(`room:${room.id}`);
        });

      } catch (error) {
        console.error('Lỗi xác thực:', error);
        socket.emit('error', error.message);
      }
    });

    socket.on('send_room_message', async (data) => {
      try {
        const userId = connectedUsers.get(socket.id);
        if (!userId) {
          throw new Error('Chưa xác thực');
        }

        const message = await Message.create({
          room_id: data.roomId,
          sender_id: userId,
          content: data.content,
          type: data.type || 'text'
        });

        const enrichedMessage = await Message.findOne({
          where: { id: message.id },
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'display_name', 'avatar']
          }]
        });

        const messageData = {
          ...enrichedMessage.toJSON(),
          sender_name: enrichedMessage.sender.display_name || enrichedMessage.sender.username,
          sender_avatar: enrichedMessage.sender.avatar,
          isOwn: false
        };

        // Broadcast to room
        socket.to(`room:${data.roomId}`).emit('receive_message', messageData);

        // Send back to sender with isOwn flag
        messageData.isOwn = true;
        socket.emit('receive_message', messageData);
      } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error);
        socket.emit('error', error.message);
      }
    });

    socket.on('typing_start', (data) => {
      const userId = connectedUsers.get(socket.id);
      if (!userId) return;

      if (data.roomId) {
        socket.to(`room:${data.roomId}`).emit('user_typing', {
          userId,
          roomId: data.roomId,
          isTyping: true
        });
      }
    });

    socket.on('typing_end', (data) => {
      const userId = connectedUsers.get(socket.id);
      if (!userId) return;

      if (data.roomId) {
        socket.to(`room:${data.roomId}`).emit('user_typing', {
          userId,
          roomId: data.roomId,
          isTyping: false
        });
      }
    });

    socket.on('join_room', (roomId) => {
      const userId = connectedUsers.get(socket.id);
      if (!userId) return;

      socket.join(`room:${roomId}`);
      console.log(`Người dùng ${userId} tham gia phòng ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      const userId = connectedUsers.get(socket.id);
      if (!userId) return;

      socket.leave(`room:${roomId}`);
      console.log(`Người dùng ${userId} rời phòng ${roomId}`);
    });

    socket.on('disconnect', async () => {
      const userId = connectedUsers.get(socket.id);
      if (userId) {
        try {
          // Update user status
          await User.update(
            { status: 'offline' },
            { where: { id: userId } }
          );
          
          // Broadcast status change
          io.emit('user_status_change', { 
            userId, 
            status: 'offline' 
          });
          
          // Clean up maps
          connectedUsers.delete(socket.id);
          userSockets.delete(userId);
          
          console.log('Người dùng ngắt kết nối:', socket.id);
        } catch (error) {
          console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
        }
      }
    });
  }

  return {
    handleConnection
  };
}

module.exports = createChatHandler;