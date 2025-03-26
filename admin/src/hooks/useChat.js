import { useState, useEffect, useRef, useCallback } from 'react';
import { message } from 'antd';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { chatService, userService } from '../services';

export function useChat(roomId, userId) {
  const { socket } = useSocket();
  const { user } = useAuth();
  
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
  const [banInfo, setBanInfo] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const messageContainerRef = useRef(null);

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
    } else if (userId) {
      setActiveChat(userId);
      setChatType('direct');
      loadDirectMessages(userId);
      fetchUserDetails(userId);
    }
  }, [roomId, userId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !activeChat) return;

    if (chatType === 'room') {
      socket.emit('join_room', activeChat);
    }

    socket.on('receive_message', (message) => {
      setMessages(prev => [message, ...prev]);
    });

    socket.on('user_status_change', ({ userId, status }) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status } : u
      ));
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_status_change');
      if (chatType === 'room') {
        socket.emit('leave_room', activeChat);
      }
    };
  }, [socket, activeChat, chatType]);
  
  // Infinite scroll handler
  const handleScroll = useCallback((e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !loading) {
      loadMoreMessages();
    }
  }, [hasMore, loading, activeChat, chatType]);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

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
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    if (chatType === 'room' && !isMember) {
      message.warning('Bạn cần tham gia phòng chat để gửi tin nhắn');
      return;
    }

    if (chatType === 'room' && banInfo) {
      message.error('Bạn đã bị cấm chat trong phòng này');
      return;
    }

    try {
      let msg;
      if (chatType === 'room') {
        msg = await chatService.createMessage(activeChat, newMessage.trim(), 'text');

      } else {
        msg = await chatService.createDirectMessage(activeChat, newMessage.trim(), 'text');
      }
      
      if (msg) {
        setMessages(prev => [msg, ...prev]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Không thể gửi tin nhắn');
    }
  };

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
    banInfo,
    isMember,
    showJoinModal,
    messageContainerRef,

    // Actions
    setActiveTab,
    setNewMessage,
    setIsModalVisible,
    setIsDetailsVisible,
    setNewRoomName,
    setShowEmojiPicker,
    handleSendMessage,
    handleFileUpload,
    handleEmojiSelect,
    handleJoinRoom,
    handleCancelJoinRoom,
    handleLeaveRoom,
    handleKickMember,
    handleBanUser,
    handleChangeRole,
    createRoom,
    setShowJoinModal
  };
}