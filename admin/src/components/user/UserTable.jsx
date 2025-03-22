import React from 'react';
import { Table, Button, Space, Tag, Badge, Avatar, Typography, Tooltip, Popconfirm, Switch } from 'antd';
import { MessageOutlined, EditOutlined, DeleteOutlined, UserOutlined, UnlockOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Text } = Typography;

const roleColors = {
  admin: '#ff4d4f',
  moderator: '#faad14',
  user: '#52c41a'
};

const roleLabels = {
  admin: 'Quản trị viên',
  moderator: 'Điều hành viên',
  user: 'Người dùng'
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
    // Admin can manage everyone except themselves
    if (currentUser.role === 'admin') {
      return targetUser.id !== currentUser.id;
    }
    
    // Moderator can only manage regular users and cannot modify roles
    if (currentUser.role === 'moderator') {
      return targetUser.role === 'user';
    }
    
    return false;
  };

  // Function to check if user can edit role
  const canEditRole = (targetUser) => {
    // Only admin can edit roles
    return currentUser.role === 'admin' && targetUser.id !== currentUser.id;
  };

  // Function to check if user can create new users
  const canCreateUser = () => {
    // Only admin can create users
    return currentUser.role === 'admin';
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
            backgroundColor: !record.avatar ? roleColors[record.role] : 'transparent',
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
        <Tag color={roleColors[role]}>
          {roleLabels[role]}
        </Tag>
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
        const canModifyRole = canEditRole(record);
        
        return (
          <Space>
            <Tooltip title="Chỉnh sửa">
              <Button 
                icon={<EditOutlined />} 
                onClick={() => onEdit(record)}
                disabled={!canManage && !canModifyRole}
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