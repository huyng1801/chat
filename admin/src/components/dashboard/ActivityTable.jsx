import React from 'react';
import { Table, Tag, Typography, Space, Avatar } from 'antd';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { UserOutlined } from '@ant-design/icons';
import { colors } from '../../constants/colors';

const { Text } = Typography;

function ActivityTable({ data, loading }) {
  const columns = [
    {
      title: 'Người gửi',
      key: 'sender',
      render: (_, record) => (
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            src={record.sender.avatar}
            style={{
              backgroundColor: !record.sender.avatar ? colors.primary : 'transparent'
            }}
          />
          <Text strong>{record.sender.name}</Text>
        </Space>
      )
    },
    {
      title: 'Nội dung',
      key: 'content',
      render: (_, record) => (
        <Space>
          <Text>{record.content}</Text>
          <Tag color={record.messageType === 'text' ? 'default' : 'blue'}>
            {record.messageType}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Đích đến',
      key: 'target',
      render: (_, record) => (
        <Tag color={record.target.type === 'room' ? 'cyan' : 'purple'}>
          {record.target.type === 'room' ? 'Phòng: ' : 'Người dùng: '}
          {record.target.name}
        </Tag>
      )
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <Text type="secondary">
          {format(new Date(record.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
        </Text>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={false}
    />
  );
}

export default ActivityTable;