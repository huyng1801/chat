import React from 'react';
import { Table, Button, Space, Tag, Avatar, Typography, Tooltip, Popconfirm } from 'antd';
import { TeamOutlined, MessageOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Text } = Typography;

function ChatRoomTable({ 
  rooms, 
  loading, 
  onEdit, 
  onDelete,
  onViewDetails,
  pagination,
  onChange,
  rowSelection
}) {
  const columns = [
    {
      title: 'Thông tin phòng',
      dataIndex: 'name',
      key: 'info',
      render: (_, record) => (
        <Space>
          <Avatar 
            icon={<TeamOutlined />} 
            style={{ backgroundColor: '#1677ff' }}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description || 'Không có mô tả'}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Thống kê',
      key: 'stats',
      render: (_, record) => (
        <Space>
          <Tag color="blue">
            <Space>
              <TeamOutlined />
              {record.member_count} thành viên
            </Space>
          </Tag>
          <Tag color="cyan">
            <Space>
              <MessageOutlined />
              {record.message_count} tin nhắn
            </Space>
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: 'creator_name',
      key: 'creator',
    },
    {
      title: 'Hoạt động cuối',
      dataIndex: 'last_activity',
      key: 'lastActivity',
      render: (date) => date ? (
        <Tooltip title={format(new Date(date), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}>
          {format(new Date(date), 'dd/MM/yyyy', { locale: vi })}
        </Tooltip>
      ) : (
        'Chưa có hoạt động'
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'createdAt',
      render: (date) => (
        <Tooltip title={format(new Date(date), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}>
          {format(new Date(date), 'dd/MM/yyyy', { locale: vi })}
        </Tooltip>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => onViewDetails(record)}
            />
          </Tooltip>
          
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa phòng chat"
              description="Bạn có chắc chắn muốn xóa phòng chat này?"
              onConfirm={() => onDelete(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button 
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={rooms}
      loading={loading}
      rowKey="id"
      rowSelection={rowSelection}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `Tổng số ${total} phòng chat`
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

export default ChatRoomTable;