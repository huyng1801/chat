import React from 'react';
import { Avatar, Space, Typography, Tag, Badge, Button } from 'antd';
import { UserOutlined, CloseOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Text, Title } = Typography;

function UserDetails({ user, onClose }) {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'HH:mm dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return '';
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text strong>Thông tin người dùng</Text>
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={onClose}
        />
      </div>

      {/* User Info */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 16px' }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* Avatar & Name */}
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              size={80}
              src={user.avatar} 
              icon={<UserOutlined />}
              style={{
                backgroundColor: !user.avatar ? '#1677ff' : 'transparent',
                marginBottom: '16px'
              }}
            />
            <Title level={4} style={{ margin: 0 }}>
              {user.display_name || user.username}
            </Title>
            <Text type="secondary">@{user.username}</Text>
          </div>

          {/* Status */}
          <div>
            <Text type="secondary" style={{ marginBottom: '8px', display: 'block' }}>
              Trạng thái
            </Text>
            <Badge 
              status={user.status === 'online' ? 'success' : 'default'}
              text={
                <Text>
                  {user.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                </Text>
              }
            />
          </div>

          {/* Role */}
          <div>
            <Text type="secondary" style={{ marginBottom: '8px', display: 'block' }}>
              Vai trò
            </Text>
            <Tag color={
              user.role === 'admin' ? 'red' : 
              user.role === 'moderator' ? 'orange' : 
              'green'
            }>
              {user.role === 'admin' ? 'Quản trị viên' :
               user.role === 'moderator' ? 'Điều hành viên' :
               'Người dùng'}
            </Tag>
          </div>

          {/* Join Date */}
          <div>
            <Text type="secondary" style={{ marginBottom: '8px', display: 'block' }}>
              Ngày tham gia
            </Text>
            <Text>{formatDate(user.created_at)}</Text>
          </div>
        </Space>
      </div>
    </div>
  );
}

export default UserDetails;