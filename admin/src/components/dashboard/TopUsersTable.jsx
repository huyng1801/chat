import React from 'react';
import { Table, Avatar, Badge, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { colors } from '../../constants/colors';

const { Text } = Typography;

function TopUsersTable({ data, loading }) {
  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar 
            size={32}
            src={record.avatar}
            icon={<UserOutlined />}
            style={{
              backgroundColor: !record.avatar ? colors.primary : 'transparent'
            }}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{record.username}</Text>
            <Badge 
              status={record.status === 'online' ? 'success' : 'default'}
              text={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                </Text>
              }
            />
          </Space>
        </Space>
      )
    },
    {
      title: 'Tin nhắn phòng',
      dataIndex: 'roomMessages',
      key: 'roomMessages',
      align: 'center',
      render: value => (
        <Text>{value}</Text>
      )
    },
    {
      title: 'Tin nhắn riêng',
      dataIndex: 'directMessages',
      key: 'directMessages',
      align: 'center',
      render: value => (
        <Text>{value}</Text>
      )
    },
    {
      title: 'Tổng tin nhắn',
      dataIndex: 'totalMessages',
      key: 'totalMessages',
      align: 'center',
      render: value => (
        <Text strong>{value}</Text>
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
      size="small"
    />
  );
}

export default TopUsersTable;