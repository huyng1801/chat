import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layout, Empty, message, Modal, Radio, Space, Input } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { chatService, userService } from '../services';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import RoomDetails from '../components/chat/RoomDetails';
import UserDetails from '../components/chat/UserDetails';

function Chat() {
  const { roomId, userId } = useParams();
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

  // Handle room join
  const handleJoinRoom = async () => {
    try {
      await chatService.joinRoom(roomId);
      message.success('Đã gửi yêu cầu tham gia phòng chat');
      setShowJoinModal(false);
    } catch (error) {
      message.error('Không thể tham gia phòng chat');
    }
  };

  // Handle room join modal cancel
  const handleJoinCancel = () => {
    setShowJoinModal(false);
  };

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
      const data = await chatService.getChatUsers();
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
      navigate('/chat');
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
      navigate('/chat');
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
      let message;
      if (chatType === 'room') {
        message = await chatService.createMessage(
          roomId,
          user.id,
          newMessage.trim(),
          'text'
        );
      } else {
        message = await chatService.createDirectMessage(
          userId,
          newMessage.trim(),
          'text'
        );
      }
      
      if (message) {
        setMessages(prev => [message, ...prev]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Không thể gửi tin nhắn');
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

  // Room management handlers
  const handleKickMember = async (roomId, userId) => {
    try {
      await chatService.kickMember(roomId, userId);
      message.success('Đã kick thành viên');
      
      // Update room details to reflect new member count
      const updatedRoom = await chatService.getRoom(roomId);
      setActiveChatInfo(updatedRoom);
      
      // Also update the room in the rooms list
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId 
            ? { 
                ...room, 
                member_count: (room.member_count || 0) - 1 
              }
            : room
        )
      );
      
      // Refresh room details to update member list
      fetchRoomDetails(roomId);
    } catch (error) {
      message.error('Không thể kick thành viên');
    }
  };

  const handleBanUser = async (roomId, userId) => {
    Modal.confirm({
      title: 'Cấm thành viên',
      content: (
        <div>
          <p>Chọn thời gian cấm:</p>
          <Radio.Group defaultValue="1h">
            <Space direction="vertical">
              <Radio value="1h">1 giờ</Radio>
              <Radio value="6h">6 giờ</Radio>
              <Radio value="12h">12 giờ</Radio>
              <Radio value="24h">24 giờ</Radio>
              <Radio value="7d">7 ngày</Radio>
              <Radio value="30d">30 ngày</Radio>
            </Space>
          </Radio.Group>
          <Input.TextArea
            placeholder="Lý do cấm (không bắt buộc)"
            style={{ marginTop: '16px' }}
          />
        </div>
      ),
      okText: 'Cấm',
      cancelText: 'Hủy',
      onOk: async (close) => {
        try {
          const duration = document.querySelector('.ant-radio-wrapper-checked input')?.value || '1h';
          const reason = document.querySelector('.ant-input')?.value;

          await chatService.banUser(roomId, userId, {
            duration,
            reason
          });

          message.success('Đã cấm thành viên');
          
          // Update ban status
          const banStatus = await chatService.checkBanStatus(roomId, userId);
          setBanInfo(banStatus.banInfo);
          
          // Update room details to reflect changes
          fetchRoomDetails(roomId);
          
          close();
        } catch (error) {
          message.error('Không thể cấm thành viên');
        }
      }
    });
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

  const handleLeaveRoom = async (roomId) => {
    try {
      await chatService.leaveRoom(roomId);
      message.success('Đã rời phòng chat');
      navigate('/chat');
      fetchRooms();
    } catch (error) {
      message.error('Không thể rời phòng chat');
    }
  };

  // Room creation
  const createRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const room = await chatService.createRoom({ 
        name: newRoomName.trim() 
      });
      
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

  // Navigation handlers
  const handleRoomSelect = (room) => {
    setActiveChat(room.id);
    setActiveChatInfo(room);
    setChatType('room');
    loadRoomMessages(room.id);
    checkMembershipAndBanStatus(room.id);
    navigate(`/chat/room/${room.id}`);
  };

  const handleUserSelect = (user) => {
    setActiveChat(user.id);
    setActiveChatInfo({
      ...user,
      type: 'direct',
      name: user.display_name || user.username
    });
    setChatType('direct');
    loadDirectMessages(user.id);
    navigate(`/chat/user/${user.id}`);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setActiveChat(null);
    setActiveChatInfo(null);
    setChatType(null);
    setMessages([]);
    navigate('/chat');
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <Layout style={{ height: 'calc(100vh - 164px)', minHeight:'50vh', marginTop: '24px', background: '#fff' }}>
      <ChatSidebar 
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        rooms={rooms}
        users={users}
        activeChat={activeChat}
        handleRoomSelect={handleRoomSelect}
        handleUserSelect={handleUserSelect}
        unreadMessages={unreadMessages}
        setIsModalVisible={setIsModalVisible}
      />
      
      <Layout style={{ height: 'calc(100vh - 164px)', minHeight:'50vh', display: 'flex', flexDirection: 'column' }}>
        <ChatHeader 
          activeChatInfo={activeChatInfo}
          chatType={chatType}
          onViewDetails={() => setIsDetailsVisible(true)}
          onLeaveRoom={handleLeaveRoom}
          currentUser={user}
          isModerator={isModerator}
        />
        
        <Layout style={{ height: 'calc(100vh - 164px)', minHeight:'50vh' }}>
          {activeChat ? (
            <>
              <Layout.Content style={{ display: 'flex', flexDirection: 'column' }}>
                <ChatMessages 
                  messages={messages}
                  loading={loading}
                  hasMore={hasMore}
                  messageContainerRef={messageContainerRef}
                  currentUserId={user.id}
                />
                
                <ChatInput 
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  handleFileUpload={handleFileUpload}
                  showEmojiPicker={showEmojiPicker}
                  setShowEmojiPicker={setShowEmojiPicker}
                  handleEmojiSelect={handleEmojiSelect}
                  disabled={chatType === 'room' && !isMember}
                  banInfo={banInfo}
                />
              </Layout.Content>

              {isDetailsVisible && (
                <Layout.Sider 
                  width={300} 
                  theme="light"
                  style={{ 
                    borderLeft: '1px solid #f0f0f0',
                    overflow: 'hidden'
                  }}
                >
                  {chatType === 'room' ? (
                    <RoomDetails
                      room={activeChatInfo}
                      onClose={() => setIsDetailsVisible(false)}
                      onKickMember={handleKickMember}
                      onBanUser={handleBanUser}
                      onChangeRole={handleChangeRole}
                      currentUser={user}
                      isModerator={isModerator}
                    />
                  ) : (
                    <UserDetails
                      user={activeChatInfo}
                      onClose={() => setIsDetailsVisible(false)}
                    />
                  )}
                </Layout.Sider>
              )}
            </>
          ) : (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#f5f5f5'
            }}>
              <Empty
                description={
                  activeTab === 'rooms' 
                    ? "Chọn một phòng chat để bắt đầu trò chuyện" 
                    : "Chọn một người dùng để bắt đầu trò chuyện"
                }
              />
            </div>
          )}
        </Layout>
      </Layout>

      <CreateRoomModal 
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        newRoomName={newRoomName}
        setNewRoomName={setNewRoomName}
        createRoom={createRoom}
      />

      <Modal
        title="Tham gia phòng chat"
        open={showJoinModal}
        onOk={handleJoinRoom}
        onCancel={handleJoinCancel}
        okText="Tham gia"
        cancelText="Chỉ xem"
      >
        <p>Bạn chưa là thành viên của phòng chat này. Bạn có muốn gửi yêu cầu tham gia để gửi tin nhắn?</p>
        <p style={{ color: '#666' }}>Nếu chọn "Chỉ xem", bạn vẫn có thể xem tin nhắn nhưng không thể gửi tin nhắn.</p>
      </Modal>
    </Layout>
  );
}

export default Chat;