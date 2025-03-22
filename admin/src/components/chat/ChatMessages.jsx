import React from 'react';
import { Empty, Spin, Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Text } = Typography;

function ChatMessages({ 
  messages = [], 
  loading, 
  hasMore, 
  messageContainerRef,
  currentUserId
}) {
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
        const isOwn = msg.sender_id === currentUserId;
        
        return (
          <div
            key={msg.id || index}
            style={{
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              marginBottom: '16px'
            }}
          >
            <div
              style={{
                background: isOwn ? '#e6f4ff' : '#fff',
                padding: '12px',
                borderRadius: '8px',
                position: 'relative',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {!isOwn && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px' 
                }}>
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />} 
                    src={msg.sender_avatar}
                    style={{ marginRight: '8px' }}
                  />
                  <Text strong style={{ color: '#1677ff' }}>
                    {msg.sender_name}
                  </Text>
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