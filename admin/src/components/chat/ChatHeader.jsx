import React from 'react';
import { Avatar, Badge, Button, Tooltip, Typography, Space, Dropdown } from 'antd';
import { UserOutlined, TeamOutlined, InfoCircleOutlined, MoreOutlined } from '@ant-design/icons';

const { Text } = Typography;

function ChatHeader({ 
  activeChatInfo, 
  chatType,
  onViewDetails,
  onLeaveRoom,
  onKickMember,
  onBanUser,
  currentUser,
  isModerator
}) {
  if (!activeChatInfo) return null;

  const isCreator = activeChatInfo.created_by === currentUser?.id;
  const canManage = isCreator || isModerator;

  const memberActionItems = [
    {
      key: 'kick',
      label: 'Kick khỏi phòng',
      danger: true,
      disabled: !canManage,
      onClick: () => onKickMember(activeChatInfo.id)
    },
    {
      key: 'ban',
      label: 'Cấm tham gia phòng',
      danger: true,
      disabled: !canManage,
      onClick: () => onBanUser(activeChatInfo.id)
    },
    {
      type: 'divider'
    },
    {
      key: 'leave',
      label: 'Rời phòng',
      danger: true,
      disabled: isCreator,
      onClick: () => onLeaveRoom(activeChatInfo.id)
    }
  ];

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
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {activeChatInfo.member_count} thành viên • {activeChatInfo.message_count} tin nhắn
            </Text>
          )}
        </Space>
      </div>

      <Space>
   
          <Tooltip title="Thông tin phòng">
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