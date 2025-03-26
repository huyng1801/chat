import React from 'react';
import { Table, Button, Space, Tag, Badge, Avatar, Typography, Tooltip, Popconfirm, Switch } from 'antd';
import { 
  MessageOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined, 
  UnlockOutlined,
  StarFilled,
  CrownFilled
} from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Text } = Typography;

const roleConfig = {
  owner: {
    color: '#ffd700', // Golden yellow color
    stars: [
      <CrownFilled key="crown" style={{ 
        color: '#ffd700', 
        fontSize: '20px',
      }}/>,
      <CrownFilled key="crown" style={{ 
        color: '#ffd700', 
        fontSize: '20px',
      }}/>,
      <CrownFilled key="crown" style={{ 
        color: '#ffd700', 
        fontSize: '20px',
      }}/>
    ],
    label: 'Chủ sở hữu'
  },
  admin: {
    color: '#faad14',
    stars: [
      <StarFilled key="1" style={{ color: '#faad14', fontSize: '20px' }}/>,
      <StarFilled key="2" style={{ color: '#faad14', fontSize: '20px' }}/>,
      <StarFilled key="3" style={{ color: '#faad14', fontSize: '20px' }}/>
    ],
    label: 'Quản trị viên'
  },
  moderator: {
    color: '#1677ff',
    stars: [
      <StarFilled key="1" style={{ color: '#1677ff', fontSize: '20px' }}/>,
      <StarFilled key="2" style={{ color: '#1677ff', fontSize: '20px' }}/>
    ],
    label: 'Điều hành viên'
  },
  user: {
    color: '#52c41a',
    stars: [
      <StarFilled key="1" style={{ color: '#52c41a', fontSize: '20px' }}/>
    ],
    label: 'Người dùng'
  }
};

function UserTable({ 
  users, 
  loading, 
  currentUser,
  onEdit,
  onDelete,
  onResetPassword,
  onChat,
  onToggleActive,
  pagination,
  onChange
}) {
  // Function to check if current user can manage target user
  const canManageUser = (targetUser) => {
    // Owner can manage everyone except themselves
    if (currentUser.role === 'owner') {
      return targetUser.id !== currentUser.id;
    }
    
    // Admin can manage moderators and users, but not owner or other admins
    if (currentUser.role === 'admin') {
      return ['moderator', 'user'].includes(targetUser.role) && targetUser.id !== currentUser.id;
    }
    
    // Moderator can only manage regular users
    if (currentUser.role === 'moderator') {
      return targetUser.role === 'user';
    }
    
    return false;
  };

  const columns = [
    {
      title: "Avatar",
      key: "avatar",
      width: 80,
      render: (_, record) => (
        <Avatar 
          size={40} 
          src={record.avatar} 
          icon={<UserOutlined />}
          style={{ 
            backgroundColor: !record.avatar ? roleConfig[record.role].color : 'transparent',
            opacity: record.is_active ? 1 : 0.5
          }}
        />
      ),
    },
    {
      title: "Tên hiển thị",
      dataIndex: "display_name",
      key: "displayName",
      render: (text, record) => (
        <Text strong style={{ opacity: record.is_active ? 1 : 0.5 }}>
          {text || record.username}
        </Text>
      ),
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      render: (text) => (
        <Text type="secondary">@{text}</Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => (
        <Text type="secondary">{text}</Text>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Space direction="vertical" size={2} align="center">
          <Space size={2} style={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: '4px 0'
          }}>
            {roleConfig[role].stars}
          </Space>
          <Text style={{ 
            fontSize: '12px', 
            color: roleConfig[role].color,
            textAlign: 'center',
            display: 'block'
          }}>
            {roleConfig[role].label}
          </Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Badge
            status={record.status === 'online' ? 'success' : 'default'}
            text={record.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
          />
          <Switch
            checkedChildren="Kích hoạt"
            unCheckedChildren="Vô hiệu"
            checked={record.is_active}
            onChange={(checked) => onToggleActive(record.id, checked)}
            disabled={!canManageUser(record)}
          />
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <Tooltip title={format(new Date(date), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}>
          {format(new Date(date), 'dd/MM/yyyy', { locale: vi })}
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => {
        const canManage = canManageUser(record);
        
        return (
          <Space>
            <Tooltip title="Chỉnh sửa">
              <Button 
                icon={<EditOutlined />} 
                onClick={() => onEdit(record)}
                disabled={!canManage}
              />
            </Tooltip>

            <Tooltip title="Đặt lại mật khẩu">
              <Popconfirm
                title="Đặt lại mật khẩu"
                description="Bạn có chắc chắn muốn đặt lại mật khẩu?"
                onConfirm={() => onResetPassword(record.id)}
                okText="Đồng ý"
                cancelText="Hủy"
                disabled={!canManage}
              >
                <Button 
                  icon={<UnlockOutlined />}
                  disabled={!canManage}
                />
              </Popconfirm>
            </Tooltip>

            <Tooltip title="Xóa">
              <Popconfirm
                title="Xóa người dùng"
                description="Bạn có chắc chắn muốn xóa người dùng này?"
                onConfirm={() => onDelete(record.id)}
                okText="Đồng ý"
                cancelText="Hủy"
                disabled={!canManage}
              >
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                  disabled={!canManage}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      loading={loading}
      rowKey="id"
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `Tổng số ${total} người dùng`
      }}
      onChange={(pagination, filters, sorter) => {
        onChange({
          current: pagination.current,
          pageSize: pagination.pageSize,
          sortField: sorter.field,
          sortOrder: sorter.order
        });
      }}
    />
  );
}

export default UserTable;