const { User, ChatRoom, RoomMessage, DirectMessage } = require('../models');
const { 
  createRoomMessageService,
  createRoomMemberService,
  createMessageCounterService,
  createDirectMessageService,
  createAutoReplyService,
  createForbiddenWordService
} = require('../services');

function createChatHandler(io) {
  const roomMessageService = createRoomMessageService();
  const roomMemberService = createRoomMemberService();
  const messageCounterService = createMessageCounterService();
  const directMessageService = createDirectMessageService();
  const autoReplyService = createAutoReplyService();
  const forbiddenWordService = createForbiddenWordService();
  
  const connectedUsers = new Map();
  const userSockets = new Map();
  const typingUsers = new Map();

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

        // Get unread counts for rooms and direct messages
        const [roomUnreadCounts, directUnreadCounts] = await Promise.all([
          messageCounterService.getUnreadCounts('room', userId),
          messageCounterService.getUnreadCounts('direct', userId)
        ]);

        // Send unread counts to user
        socket.emit('unread_counts', {
          rooms: roomUnreadCounts,
          direct: directUnreadCounts
        });

        const { avatar, ...userWithoutAvatar } = user.toJSON();
        console.log('User authenticated:', userWithoutAvatar);
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

        // Check if user is member of the room
        const isMember = await roomMemberService.getRoomMembers(data.roomId)
          .then(members => members.some(m => m.id === userId));

        if (!isMember) {
          throw new Error('Không có quyền gửi tin nhắn trong phòng này');
        }

        // Check forbidden words
        const { isAllowed, content } = await forbiddenWordService.checkMessage(
          data.roomId,
          data.content
        );

        if (!isAllowed) {
          throw new Error('Tin nhắn chứa từ ngữ bị cấm');
        }

        // Create message with modified content
        const { message, autoReply } = await roomMessageService.createMessage(
          data.roomId,
          userId,
          content,
          data.type || 'text'
        );

        // Get room members for counter updates
        const members = await roomMemberService.getRoomMembers(data.roomId);
        const recipientIds = members
          .filter(m => m.id !== userId)
          .map(m => m.id);

        // Increment message counters
        await messageCounterService.incrementMessageCount(
          'room',
          data.roomId,
          userId,
          recipientIds
        );

        // Get updated unread counts
        const unreadCounts = await messageCounterService.getUnreadCounts('room', userId);

        // Broadcast message and unread counts to room
        socket.to(`room:${data.roomId}`).emit('receive_message', {
          ...message.toJSON(),
          sender_name: message.sender.display_name || message.sender.username,
          sender_avatar: message.sender.avatar,
          isOwn: false
        });

        socket.to(`room:${data.roomId}`).emit('unread_counts', {
          rooms: unreadCounts
        });

        // Send back to sender with isOwn flag
        socket.emit('receive_message', {
          ...message.toJSON(),
          sender_name: message.sender.display_name || message.sender.username,
          sender_avatar: message.sender.avatar,
          isOwn: true
        });

        // If there's an auto-reply, send it
        if (autoReply) {
          socket.to(`room:${data.roomId}`).emit('receive_message', {
            ...autoReply.toJSON(),
            sender_name: autoReply.sender.display_name || autoReply.sender.username,
            sender_avatar: autoReply.sender.avatar,
            isOwn: false
          });

          socket.emit('receive_message', {
            ...autoReply.toJSON(),
            sender_name: autoReply.sender.display_name || autoReply.sender.username,
            sender_avatar: autoReply.sender.avatar,
            isOwn: false
          });
        }
      } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error);
        socket.emit('error', error.message);
      }
    });

    socket.on('send_direct_message', async (data) => {
      try {
        const senderId = connectedUsers.get(socket.id);
        if (!senderId) {
          throw new Error('Chưa xác thực');
        }

        const { message } = await directMessageService.createDirectMessage(
          senderId,
          data.receiverId,
          data.content,
          data.type || 'text'
        );

        // Increment message counter for recipient
        await messageCounterService.incrementMessageCount(
          'direct',
          data.receiverId,
          senderId,
          [data.receiverId]
        );
        console.log(message);
        // Get updated unread counts
        const unreadCounts = await messageCounterService.getUnreadCounts('direct', senderId);

        // Send to recipient
        const recipientSocket = userSockets.get(data.receiverId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('receive_direct_message', {
            ...message.toJSON(),
            sender_name: message.sender.display_name || message.sender.username,
            sender_avatar: message.sender.avatar,
            isOwn: false
          });

          io.to(recipientSocket).emit('unread_counts', {
            direct: unreadCounts
          });
        }
   
        // Send back to sender
        socket.emit('receive_direct_message', {
          ...message.toJSON(),
          sender_name: message.sender.display_name || message.sender.username,
          sender_avatar: message.sender.avatar,
          isOwn: true
        });
      } catch (error) {
        console.error('Lỗi gửi tin nhắn riêng:', error);
        socket.emit('error', error.message);
      }
    });

    socket.on('mark_as_read', async (data) => {
      try {
        const userId = connectedUsers.get(socket.id);
        if (!userId) return;

        await messageCounterService.markAsRead(
          data.type || 'room',
          userId,
          data.targetId
        );

        // Get updated unread counts
        const unreadCounts = await messageCounterService.getUnreadCounts(
          data.type || 'room',
          userId
        );

        socket.emit('unread_counts', {
          [data.type || 'room']: unreadCounts
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('typing_start', async (data) => {
      const userId = connectedUsers.get(socket.id);
      if (!userId) return;

      // Get user info
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'display_name']
      });

      if (!user) return;

      const typingData = {
        userId: user.id,
        name: user.display_name || user.username
      };

      if (data.roomId) {
        // Room typing
        const roomTypingKey = `room:${data.roomId}:typing`;
        let typingList = typingUsers.get(roomTypingKey) || new Set();
        typingList.add(typingData);
        typingUsers.set(roomTypingKey, typingList);

        socket.to(`room:${data.roomId}`).emit('typing_update', {
          roomId: data.roomId,
          users: Array.from(typingList)
        });
      } else if (data.userId) {
        // Direct message typing
        const recipientSocket = userSockets.get(data.userId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('typing_update', {
            userId: user.id,
            name: user.display_name || user.username,
            isTyping: true
          });
        }
      }
    });

    socket.on('typing_end', async (data) => {
      const userId = connectedUsers.get(socket.id);
      if (!userId) return;

      if (data.roomId) {
        // Room typing
        const roomTypingKey = `room:${data.roomId}:typing`;
        let typingList = typingUsers.get(roomTypingKey);
        if (typingList) {
          typingList = new Set(Array.from(typingList).filter(u => u.userId !== userId));
          if (typingList.size > 0) {
            typingUsers.set(roomTypingKey, typingList);
          } else {
            typingUsers.delete(roomTypingKey);
          }

          socket.to(`room:${data.roomId}`).emit('typing_update', {
            roomId: data.roomId,
            users: Array.from(typingList)
          });
        }
      } else if (data.userId) {
        // Direct message typing
        const recipientSocket = userSockets.get(data.userId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('typing_update', {
            userId,
            isTyping: false
          });
        }
      }
    });

    socket.on('join_room', async (roomId) => {
      const userId = connectedUsers.get(socket.id);
      if (!userId) return;

      // Check if user is member of the room
      const isMember = await roomMemberService.getRoomMembers(roomId)
        .then(members => members.some(m => m.id === userId));

      if (isMember) {
        socket.join(`room:${roomId}`);
        console.log(`Người dùng ${userId} tham gia phòng ${roomId}`);
      }
    });

    socket.on('leave_room', (roomId) => {
      const userId = connectedUsers.get(socket.id);
      if (!userId) return;

      socket.leave(`room:${roomId}`);
      console.log(`Người dùng ${userId} rời phòng ${roomId}`);

      // Remove from typing list
      const roomTypingKey = `room:${roomId}:typing`;
      let typingList = typingUsers.get(roomTypingKey);
      if (typingList) {
        typingList = new Set(Array.from(typingList).filter(u => u.userId !== userId));
        if (typingList.size > 0) {
          typingUsers.set(roomTypingKey, typingList);
        } else {
          typingUsers.delete(roomTypingKey);
        }

        socket.to(`room:${roomId}`).emit('typing_update', {
          roomId,
          users: Array.from(typingList)
        });
      }
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

          // Remove user from all typing lists
          for (const [key, typingList] of typingUsers.entries()) {
            if (key.startsWith('room:') && key.endsWith(':typing')) {
              const roomId = key.split(':')[1];
              typingList = new Set(Array.from(typingList).filter(u => u.userId !== userId));
              if (typingList.size > 0) {
                typingUsers.set(key, typingList);
                socket.to(`room:${roomId}`).emit('typing_update', {
                  roomId,
                  users: Array.from(typingList)
                });
              } else {
                typingUsers.delete(key);
              }
            }
          }
          
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