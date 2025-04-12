import React from 'react';
import { Layout, Empty, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import RoomDetails from '../components/chat/RoomDetails';
import UserDetails from '../components/chat/UserDetails';
import ForbiddenWordModal from '../components/chat/ForbiddenWordModal';
import { useAuth } from '../context/AuthContext';

function Chat() {
  const { roomId, userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showForbiddenWordModal, setShowForbiddenWordModal] = React.useState(false);
  
  const {
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
    setShowJoinModal,
    handleRoomSelect,
    handleUserSelect
  } = useChat(roomId, userId);

  const isOwner = activeChatInfo?.created_by === user?.id;

  return (
    <Layout style={{ height: 'calc(100vh - 164px)', minHeight:'50vh', marginTop: '24px', background: '#fff' }}>
      <ChatSidebar 
        activeTab={activeTab}
        handleTabChange={setActiveTab}
        rooms={rooms}
        users={users}
        activeChat={activeChat}
        handleRoomSelect={handleRoomSelect}
        handleUserSelect={handleUserSelect}
        unreadMessages={unreadMessages}
        lastMessages={lastMessages}
        setIsModalVisible={setIsModalVisible}
      />
      
      <Layout style={{ height: 'calc(100vh - 164px)', minHeight:'50vh', display: 'flex', flexDirection: 'column' }}>
        <ChatHeader 
          activeChatInfo={activeChatInfo}
          chatType={chatType}
          onViewDetails={() => setIsDetailsVisible(true)}
          onLeaveRoom={handleLeaveRoom}
          isModerator={isModerator}
          isMember={isMember}
          isOwner={isOwner}
          onManageForbiddenWords={() => setShowForbiddenWordModal(true)}
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
                      isModerator={isModerator}
                      currentUser={user}
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
        onCancel={handleCancelJoinRoom}
        okText="Tham gia"
        cancelText="Chỉ xem"
      >
        <p>Bạn chưa là thành viên của phòng chat này. Bạn có muốn gửi yêu cầu tham gia để gửi tin nhắn?</p>
        <p style={{ color: '#666' }}>Nếu chọn "Chỉ xem", bạn vẫn có thể xem tin nhắn nhưng không thể gửi tin nhắn.</p>
      </Modal>

      {showForbiddenWordModal && (
        <ForbiddenWordModal
          visible={showForbiddenWordModal}
          onClose={() => setShowForbiddenWordModal(false)}
          roomId={roomId}
        />
      )}
    </Layout>
  );
}

export default Chat;