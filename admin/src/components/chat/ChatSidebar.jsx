import React from 'react';
import { Layout, Tabs, Button, List, Avatar, Badge, Typography, Empty } from 'antd';
import { TeamOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';

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
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: '100%' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar 
                        size={40}
                        icon={<TeamOutlined />}
                        style={{ 
                          backgroundColor: '#1677ff',
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 500 }}>{room.name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {room.member_count || 0} thành viên
                        </Text>
                      </div>
                    </div>
                    {unreadMessages[room.id] > 0 && (
                      <Badge count={unreadMessages[room.id]} />
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
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar 
                    size={40}
                    src={user.avatar}
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: !user.avatar ? '#1677ff' : 'transparent',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{user.display_name || user.username}</div>
                    <Badge 
                      status={user.status === 'online' ? 'success' : 'default'} 
                      text={user.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                </div>
                {unreadMessages[user.id] > 0 && (
                  <Badge count={unreadMessages[user.id]} />
                )}
              </div>
            </List.Item>
          )}
        />
      )
    }
  ];

  return (
    <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
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