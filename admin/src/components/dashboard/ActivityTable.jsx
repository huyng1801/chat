import React from 'react';
import { Table, Tag, Typography, Space } from 'antd';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Text } = Typography;

function ActivityTable({ data, loading }) {
  // Ensure the total number of rows is always a multiple of 5
  const pageSize = 5;
  const remainder = data.length % pageSize;
  const filledData = [...data];
  if (remainder !== 0) {
    const emptyRows = pageSize - remainder; // Calculate how many empty rows to add
    for (let i = 0; i < emptyRows; i++) {
      filledData.push({
        id: `empty-${filledData.length}`,
        sender_name: '',
        room_name: '',
        content: '',
        created_at: null,
        type: ''
      });
    }
  }

  const columns = [
    {
      title: 'Người gửi',
      dataIndex: 'sender_name',
      key: 'sender',
      render: (text) => (
        <Text strong>{text || <Text type="secondary">Không xác định</Text>}</Text>
      )
    },
    {
      title: 'Phòng chat',
      dataIndex: 'room_name',
      key: 'room',
      render: (text) => (
        <Text>{text || <Text type="secondary">Không xác định</Text>}</Text>
      )
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text, record) => {
        if (!text) return <Text type="secondary">Không có nội dung</Text>;

        const typeColors = {
          text: 'default',
          image: 'blue',
          file: 'green'
        };

        return (
          <Space>
            <Text ellipsis style={{ maxWidth: 300 }}>{text}</Text>
            <Tag color={typeColors[record.type] || 'default'}>
              {record.type || 'text'}
            </Tag>
          </Space>
        );
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'time',
      render: (text) => {
        if (!text) return <Text type="secondary">Không xác định</Text>;

        try {
          return (
            <Text type="secondary">
              {format(new Date(text), 'HH:mm dd/MM/yyyy', { locale: vi })}
            </Text>
          );
        } catch (error) {
          return <Text type="secondary">Không xác định</Text>;
        }
      }
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={filledData}
      loading={loading}
      rowKey={(record, index) => record.id || `row-${index}`}
      pagination={{ 
        pageSize: pageSize,
        showTotal: (total) => `Tổng số ${total} hoạt động`,
        showSizeChanger: false
      }}
      style={{
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
}

export default ActivityTable;
