import React, { useEffect, useRef } from 'react';
import { Empty, Spin, Typography, Avatar, Space } from 'antd';
import { UserOutlined, FileOutlined, StarFilled, CrownFilled } from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;

function ChatMessages({ 
  messages = [], 
  loading, 
  hasMore, 
  messageContainerRef
}) {
  const { user } = useAuth();
  const lastMessageRef = useRef(null);

  // Effect to scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && messageContainerRef.current) {
      const container = messageContainerRef.current;
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      // If user is already at bottom, scroll to new message
      if (isAtBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  const EmptyMessageState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>Chưa có tin nhắn nào</p>
          <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn</p>
        </div>
      }
    />
  );

  const roleConfig = {
    owner: {
      color: '#ffd700',
      stars: [
        <CrownFilled key="crown1" style={{ color: '#ffd700', fontSize: '16px' }}/>,
        <CrownFilled key="crown2" style={{ color: '#ffd700', fontSize: '16px' }}/>,
        <CrownFilled key="crown3" style={{ color: '#ffd700', fontSize: '16px' }}/>
      ],
      background: '#fff1f0',
      border: '1px solid #ffccc7',
      nameColor: '#cf1322'
    },
    admin: {
      color: '#faad14',
      stars: [
        <StarFilled key="1" style={{ color: '#faad14', fontSize: '16px' }}/>,
        <StarFilled key="2" style={{ color: '#faad14', fontSize: '16px' }}/>,
        <StarFilled key="3" style={{ color: '#faad14', fontSize: '16px' }}/>
      ],
      background: '#fff7e6',
      border: '1px solid #ffd591',
      nameColor: '#d46b08'
    },
    moderator: {
      color: '#1677ff',
      stars: [
        <StarFilled key="1" style={{ color: '#1677ff', fontSize: '16px' }}/>,
        <StarFilled key="2" style={{ color: '#1677ff', fontSize: '16px' }}/>
      ],
      background: '#e6f7ff',
      border: '1px solid #91d5ff',
      nameColor: '#096dd9'
    },
    user: {
      color: '#52c41a',
      stars: [
        <StarFilled key="1" style={{ color: '#52c41a', fontSize: '16px' }}/>
      ],
      background: '#fff',
      border: 'none',
      nameColor: '#1677ff'
    },
    // Default config for system or undefined roles
    default: {
      color: '#1677ff',
      stars: [],
      background: '#fff',
      border: 'none',
      nameColor: '#1677ff'
    }
  };

  return (
    <div 
      ref={messageContainerRef}
      style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column-reverse',
        background: '#f5f5f5'
      }}
    >
      {messages.map((msg, index) => {
        const isOwn = msg.sender_id === user?.id;
        const role = msg.sender_role || 'default';
        const config = roleConfig[role] || roleConfig.default;
        
        return (
          <div
            key={msg.id || index}
            style={{
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              marginBottom: '16px'
            }}
            ref={index === 0 ? lastMessageRef : null}
          >
            <div
              style={{
                background: isOwn ? '#e6f4ff' : config.background,
                padding: '12px',
                borderRadius: '8px',
                position: 'relative',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: isOwn ? 'none' : config.border
              }}
            >
              {!isOwn && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  gap: '8px'
                }}>
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />} 
                    src={msg.sender_avatar}
                    style={{ 
                      backgroundColor: !msg.sender_avatar ? config.color : 'transparent'
                    }}
                  />
                  <Space direction="vertical" size={0}>
                    <Space align="center" size={4}>
                      <Text strong style={{ color: config.nameColor }}>
                        {msg.sender_name}
                      </Text>
                      {config.stars && config.stars.length > 0 && (
                        <Space size={0}>
                          {config.stars}
                        </Space>
                      )}
                    </Space>
                  </Space>
                </div>
              )}
              
              {msg.type === 'image' ? (
                <img 
                  src={msg.content} 
                  alt="Đã chia sẻ" 
                  style={{ 
                    maxWidth: '100%', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(msg.content, '_blank')}
                />
              ) : msg.type === 'file' ? (
                <a 
                  href={msg.content} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#1677ff'
                  }}
                >
                  <FileOutlined style={{ marginRight: '8px' }} />
                  {msg.content.split('/').pop()}
                </a>
              ) : (
                <div style={{ 
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              )}
              
              <div style={{ 
                fontSize: '12px', 
                color: 'rgba(0, 0, 0, 0.45)',
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {format(new Date(msg.created_at), 'HH:mm', { locale: vi })}
              </div>
            </div>
          </div>
        );
      })}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="small" />
        </div>
      )}
      
      {!hasMore && messages.length > 0 && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text type="secondary">Không còn tin nhắn cũ hơn</Text>
        </div>
      )}
      
      {messages.length === 0 && !loading && <EmptyMessageState />}
    </div>
  );
}

export default ChatMessages;