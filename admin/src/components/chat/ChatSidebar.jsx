import React from 'react';
import { Layout, Tabs, Button, List, Avatar, Badge, Typography, Empty, Tooltip } from 'antd';
import { TeamOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Sider } = Layout;
const { Text } = Typography;

function ChatSidebar({
  activeTab = 'rooms',
  handleTabChange,
  rooms = [],
  users = [],
  activeChat,
  handleRoomSelect,
  handleUserSelect,
  unreadMessages = {},
  lastMessages = {},
  setIsModalVisible
}) {

  const EmptyRoomState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>Chưa có phòng chat nào</p>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            Tạo phòng chat đầu tiên
          </Button>
        </div>
      }
    />
  );

  const EmptyUserState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>Chưa có người dùng nào</p>
          <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Người dùng sẽ xuất hiện khi họ tham gia</p>
        </div>
      }
    />
  );

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return format(date, isToday ? 'HH:mm' : 'dd/MM', { locale: vi });
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderLastMessage = (id, type = 'room') => {
    const message = lastMessages[id];
    if (!message) return null;

    const messageContent = message.type === 'text' ? message.content : `[${message.type}]`;
    const displayText = type === 'room' 
      ? `${message.sender_name}: ${messageContent}`
      : messageContent;

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%',
        marginTop: '4px'
      }}>
        <Tooltip title={displayText}>
          <Text 
            type="secondary" 
            style={{ 
              fontSize: '12px',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block'
            }}
          >
            {truncateText(displayText)}
          </Text>
        </Tooltip>
        <Text type="secondary" style={{ fontSize: '12px', flexShrink: 0, marginLeft: '8px' }}>
          {formatMessageTime(message.created_at)}
        </Text>
      </div>
    );
  };

  const items = [
    {
      key: 'rooms',
      label: (
        <span>
          <TeamOutlined />
          Phòng Chat
        </span>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Button 
            type="primary" 
            onClick={() => setIsModalVisible(true)}
            block
            style={{ marginBottom: '16px' }}
            icon={<PlusOutlined />}
          >
            Tạo phòng chat
          </Button>
          {rooms.length === 0 ? (
            <EmptyRoomState />
          ) : (
            <List
              dataSource={rooms}
              renderItem={room => (
                <List.Item
                  onClick={() => handleRoomSelect?.(room)}
                  style={{ 
                    cursor: 'pointer',
                    background: activeChat === room.id ? '#f0f7ff' : 'transparent',
                    padding: '8px 16px',
                    margin: 0,
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    width: '100%' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <Avatar 
                        size={40}
                        icon={<TeamOutlined />}
                        style={{ 
                          backgroundColor: '#1677ff',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: unreadMessages[room.id] > 0 ? 600 : 500,
                          color: unreadMessages[room.id] > 0 ? '#1677ff' : 'inherit'
                        }}>
                          {room.name}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {room.member_count || 0} thành viên
                        </Text>
                        {renderLastMessage(room.id, 'room')}
                      </div>
                    </div>
                    {unreadMessages[room.id] > 0 && (
                      <Badge 
                        count={unreadMessages[room.id]} 
                        style={{ marginLeft: '8px', marginTop: '8px' }}
                      />
                    )}
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      )
    },
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          Người dùng
        </span>
      ),
      children: users.length === 0 ? (
        <EmptyUserState />
      ) : (
        <List
          dataSource={users}
          renderItem={user => (
            <List.Item
              onClick={() => handleUserSelect?.(user)}
              style={{ 
                cursor: 'pointer',
                background: activeChat === user.id ? '#f0f7ff' : 'transparent',
                padding: '8px 16px',
                margin: 0,
                borderRadius: '4px'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                width: '100%'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Avatar 
                    size={40}
                    src={user.avatar}
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: !user.avatar ? '#1677ff' : 'transparent',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: unreadMessages[user.id] > 0 ? 600 : 500,
                      color: unreadMessages[user.id] > 0 ? '#1677ff' : 'inherit'
                    }}>
                      {user.display_name || user.username}
                    </div>
                    <Badge 
                      status={user.status === 'online' ? 'success' : 'default'} 
                      text={user.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                      style={{ fontSize: '12px' }}
                    />
                    {renderLastMessage(user.id, 'direct')}
                  </div>
                </div>
                {unreadMessages[user.id] > 0 && (
                  <Badge 
                    count={unreadMessages[user.id]} 
                    style={{ marginLeft: '8px', marginTop: '8px' }}
                  />
                )}
              </div>
            </List.Item>
          )}
        />
      )
    }
  ];

  return (
    <Sider width={350} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
      <Tabs 
        activeKey={activeTab}
        onChange={handleTabChange}
        items={items}
        style={{ padding: '0 16px' }}
      />
    </Sider>
  );
}

export default ChatSidebar;