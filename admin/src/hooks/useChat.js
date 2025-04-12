import { useState, useEffect, useRef, useCallback } from 'react';
import { message } from 'antd';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { chatService, userService } from '../services';
import { useNavigate } from 'react-router-dom';

export function useChat(roomId, userId) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  // State
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('rooms');
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatInfo, setActiveChatInfo] = useState(null);
  const [chatType, setChatType] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [banInfo, setBanInfo] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const messageContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message) => {
      setMessages(prev => [message, ...prev]);
      setLastMessages(prev => ({
        ...prev,
        [message.room_id]: message
      }));
    });

    socket.on('receive_direct_message', (message) => {
      setMessages(prev => [message, ...prev]);
      setLastMessages(prev => ({
        ...prev,
        [message.sender_id]: message
      }));
    });

    socket.on('unread_counts', ({ rooms = {}, direct = {} }) => {
      setUnreadMessages(prev => ({
        ...prev,
        ...rooms,
        ...direct
      }));
    });

    socket.on('typing_update', (data) => {
      if (data.roomId) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(data.roomId, data.users);
          return newMap;
        });
      } else {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (data.isTyping) {
            newMap.set(data.userId, data.name);
          } else {
            newMap.delete(data.userId);
          }
          return newMap;
        });
      }
    });

    socket.on('user_status_change', ({ userId, status }) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status } : u
      ));
    });

    socket.on('error', (error) => {
      message.error(error);
    });

    return () => {
      socket.off('receive_message');
      socket.off('receive_direct_message');
      socket.off('unread_counts');
      socket.off('typing_update');
      socket.off('user_status_change');
      socket.off('error');
    };
  }, [socket]);

  // Load initial data
  useEffect(() => {
    fetchRooms();
    fetchUsers();
    
    if (roomId) {
      setActiveChat(roomId);
      setChatType('room');
      loadRoomMessages(roomId);
      fetchRoomDetails(roomId);
      checkMembershipAndBanStatus(roomId);
      socket?.emit('join_room', roomId);
    } else if (userId) {
      setActiveChat(userId);
      setChatType('direct');
      loadDirectMessages(userId);
      fetchUserDetails(userId);
    }

    return () => {
      if (roomId) {
        socket?.emit('leave_room', roomId);
      }
    };
  }, [roomId, userId, socket]);

  // Data fetching functions
  const fetchRooms = async () => {
    try {
      const data = await chatService.getRooms();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      message.error('Không thể tải danh sách phòng chat');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getChatUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoomDetails = async (roomId) => {
    try {
      const room = await chatService.getRoom(roomId);
      if (!room) {
        throw new Error('Không tìm thấy phòng chat');
      }
      setActiveChatInfo(room);
      
      // Check if user is moderator
      const member = room.members?.find(m => m.id === user.id);
      setIsModerator(member?.role === 'moderator');
    } catch (error) {
      console.error('Error fetching room details:', error);
      message.error('Không thể tải thông tin phòng chat');
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const userData = await userService.getUser(userId);
      setActiveChatInfo({
        ...userData,
        type: 'direct',
        name: userData.display_name || userData.username
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      message.error('Không thể tải thông tin người dùng');
    }
  };

  // Message loading functions
  const loadRoomMessages = async (roomId, pageNum = 1) => {
    if (!roomId) return;

    setLoading(true);
    try {
      const data = await chatService.getMessagesByRoom(roomId, pageNum);
      
      if (pageNum === 1) {
        setMessages(data.messages || []);
      } else {
        setMessages(prev => [...prev, ...(data.messages || [])]);
      }

      setHasMore(data.pagination?.hasMore || false);
      setPage(pageNum);

      // Mark messages as read
      socket?.emit('mark_as_read', {
        type: 'room',
        targetId: roomId
      });
    } catch (error) {
      console.error('Error loading room messages:', error);
      message.error('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const loadDirectMessages = async (userId, pageNum = 1) => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await chatService.getDirectMessages(userId, pageNum);
      
      if (pageNum === 1) {
        setMessages(data.messages || []);
      } else {
        setMessages(prev => [...prev, ...(data.messages || [])]);
      }

      setHasMore(data.pagination?.hasMore || false);
      setPage(pageNum);

      // Mark messages as read
      socket?.emit('mark_as_read', {
        type: 'direct',
        targetId: userId
      });
    } catch (error) {
      console.error('Error loading direct messages:', error);
      message.error('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!activeChat || loading || !hasMore) return;
    
    if (chatType === 'room') {
      await loadRoomMessages(activeChat, page + 1);
    } else {
      await loadDirectMessages(activeChat, page + 1);
    }
  };

  // Message handlers
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat || !socket) return;

    if (chatType === 'room') {
      if (!isMember) return message.warning('Bạn cần tham gia phòng chat để gửi tin nhắn');
      if (banInfo) return message.error('Bạn đã bị cấm chat trong phòng này');

      socket.emit('send_room_message', {
        roomId: activeChat,
        content: newMessage.trim(),
        type: 'text'
      });
    } else {
      socket.emit('send_direct_message', {
        receiverId: activeChat,
        content: newMessage.trim(),
        type: 'text'
      });
    }

    setNewMessage('');
    setShowEmojiPicker(false);
    
    // Scroll to bottom immediately for sender
    setTimeout(() => {
      const container = messageContainerRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    }, 0);
  };

  // Typing handlers
  const handleTypingStart = useCallback(() => {
    if (!socket || !activeChat) return;

    if (chatType === 'room') {
      socket.emit('typing_start', { roomId: activeChat });
    } else {
      socket.emit('typing_start', { userId: activeChat });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (chatType === 'room') {
        socket.emit('typing_end', { roomId: activeChat });
      } else {
        socket.emit('typing_end', { userId: activeChat });
      }
    }, 3000);
  }, [socket, activeChat, chatType]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Room management handlers
  const handleJoinRoom = async () => {
    try {
      await chatService.joinRoom(roomId);
      message.success('Đã gửi yêu cầu tham gia phòng chat');
      setShowJoinModal(false);
    } catch (error) {
      message.error('Không thể tham gia phòng chat');
    }
  };

  const handleCancelJoinRoom = async () => {
    setShowJoinModal(false);
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await chatService.leaveRoom(roomId);
      message.success('Đã rời phòng chat');
      socket?.emit('leave_room', roomId);
      fetchRooms();
    } catch (error) {
      message.error('Không thể rời phòng chat');
    }
  };

  const handleKickMember = async (roomId, userId) => {
    try {
      await chatService.kickMember(roomId, userId);
      message.success('Đã kick thành viên');
      fetchRoomDetails(roomId);
    } catch (error) {
      message.error('Không thể kick thành viên');
    }
  };

  const handleBanUser = async (roomId, userId, duration, reason) => {
    try {
      await chatService.banUser(roomId, userId, { duration, reason });
      message.success('Đã cấm thành viên');
      
      // Update ban status
      const banStatus = await chatService.checkBanStatus(roomId, userId);
      setBanInfo(banStatus.banInfo);
      
      // Update room details
      fetchRoomDetails(roomId);
    } catch (error) {
      message.error('Không thể cấm thành viên');
    }
  };

  const handleChangeRole = async (roomId, userId, newRole) => {
    try {
      await chatService.updateMemberRole(roomId, userId, newRole);
      message.success(`Đã ${newRole === 'moderator' ? 'thăng cấp' : 'hạ cấp'} thành viên`);
      fetchRoomDetails(roomId);
    } catch (error) {
      message.error('Không thể thay đổi vai trò thành viên');
    }
  };

  // Room creation
  const createRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const room = await chatService.createRoom({ name: newRoomName.trim() });
      if (room) {
        setRooms(prev => [room, ...prev]);
        setIsModalVisible(false);
        setNewRoomName('');
        message.success('Tạo phòng chat thành công');
      }
    } catch (error) {
      message.error('Không thể tạo phòng chat');
    }
  };

  // Check membership and ban status
  const checkMembershipAndBanStatus = async (roomId) => {
    if (!user) return;

    try {
      // Check membership
      const room = await chatService.getRoom(roomId);
      const member = room.members?.find(m => 
        m.id === user.id && 
        m.RoomMember?.status === 'accepted'
      );
      setIsMember(!!member);

      // Check ban status
      const response = await chatService.checkBanStatus(roomId, user.id);
      setBanInfo(response.banInfo);

      // Show join modal if not a member and not banned
      if (!member && !response.banInfo) {
        setShowJoinModal(true);
      }
    } catch (error) {
      console.error('Error checking membership and ban status:', error);
    }
  };

  // File upload handler
  const handleFileUpload = async (file, type) => {
    try {
      message.info('Tính năng đang được phát triển');
    } catch (error) {
      message.error('Không thể tải lên tệp');
    }
  };

  // Emoji handler
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  // Handle room/user selection
  const handleRoomSelect = (room) => {
    navigate(`/chat/room/${room.id}`);
  };

  const handleUserSelect = (selectedUser) => {
    navigate(`/chat/user/${selectedUser.id}`);
  };
  return {
    // State
    messages,
    rooms,
    users,
    activeTab,
    activeChat,
    activeChatInfo,
    chatType,
    newMessage,
    isModalVisible,
    isDetailsVisible,
    newRoomName,
    showEmojiPicker,
    loading,
    hasMore,
    isModerator,
    unreadMessages,
    lastMessages,
    banInfo,
    isMember,
    showJoinModal,
    typingUsers,
    messageContainerRef,

    // Actions
    setActiveTab,
    setNewMessage,
    setIsModalVisible,
    setIsDetailsVisible,
    setNewRoomName,
    setShowEmojiPicker,
    handleSendMessage,
    handleTypingStart,
    handleFileUpload,
    handleEmojiSelect,
    handleJoinRoom,
    handleCancelJoinRoom,
    handleLeaveRoom,
    handleKickMember,
    handleBanUser,
    handleChangeRole,
    createRoom,
    setShowJoinModal,
    handleRoomSelect,
    handleUserSelect,
    loadMoreMessages
  };
}