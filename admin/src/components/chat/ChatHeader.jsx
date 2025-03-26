import React from 'react';
import { Avatar, Badge, Button, Tooltip, Typography, Space } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  InfoCircleOutlined,
  StopOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Text } = Typography;

function ChatHeader({ 
  activeChatInfo, 
  chatType,
  onViewDetails,
  onLeaveRoom,
  isModerator,
  isMember,
  onManageForbiddenWords,
  isOwner
}) {
  if (!activeChatInfo) return null;

  return (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid #f0f0f0',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {chatType === 'direct' ? (
          <Avatar 
            size={40}
            src={activeChatInfo.avatar}
            icon={<UserOutlined />}
            style={{
              backgroundColor: !activeChatInfo.avatar ? '#1677ff' : 'transparent'
            }}
          />
        ) : (
          <Avatar 
            size={40}
            icon={<TeamOutlined />}
            style={{ backgroundColor: '#1677ff' }}
          />
        )}
        <Space direction="vertical" size={0}>
          <Text strong>{activeChatInfo.name}</Text>
          {chatType === 'direct' ? (
            <Badge 
              status={activeChatInfo.status === 'online' ? 'success' : 'default'} 
              text={activeChatInfo.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
              style={{ fontSize: '12px' }}
            />
          ) : (
            <Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {activeChatInfo.member_count} thành viên • {activeChatInfo.message_count} tin nhắn
              </Text>
              {isMember ? (
                <Badge status="success" text="Đã tham gia" style={{ fontSize: '12px' }} />
              ) : (
                <Badge status="default" text="Chưa tham gia" style={{ fontSize: '12px' }} />
              )}
            </Space>
          )}
        </Space>
      </div>

      <Space>

        
      {chatType === 'room' && isMember && !isOwner && (
          <Tooltip title="Rời phòng">
            <Button 
              type="text" 
              danger
              icon={<LogoutOutlined />}
              onClick={() => onLeaveRoom(activeChatInfo.id)}
            />
          </Tooltip>
        )}
        
        {chatType === 'room' && (isModerator || isOwner) && (
          <Tooltip title="Quản lý từ cấm">
            <Button 
              icon={<StopOutlined />}
              onClick={onManageForbiddenWords}
            />
          </Tooltip>
        )}


        <Tooltip title="Thông tin">
          <Button 
            icon={<InfoCircleOutlined />} 
            onClick={onViewDetails}
          />
        </Tooltip>
      </Space>
    </div>
  );
}

export default ChatHeader;