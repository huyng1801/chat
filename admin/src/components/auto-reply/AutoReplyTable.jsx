import React from 'react';
import { Table, Button, Space, Tag, Typography, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

function AutoReplyTable({ loading, replies, onEdit, onDelete, pagination, onChange }) {
  const columns = [
    {
      title: 'Từ khóa',
      dataIndex: 'keyword',
      key: 'keyword',
      width: '20%'
    },
    {
      title: 'Phản hồi',
      dataIndex: 'response',
      key: 'response',
      width: '30%',
      render: text => (
        <div style={{ 
          maxHeight: '100px', 
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {text}
        </div>
      )
    },
    {
      title: 'Phòng chat',
      dataIndex: 'room',
      key: 'room',
      render: room => room ? room.name : 'Tất cả phòng'
    },
    {
      title: 'Chế độ khớp',
      dataIndex: 'match_mode',
      key: 'matchMode',
      render: mode => {
        const modeLabels = {
          exact: 'Chính xác',
          contains: 'Chứa từ khóa',
          starts_with: 'Bắt đầu bằng',
          ends_with: 'Kết thúc bằng',
          regex: 'Biểu thức chính quy'
        };
        return modeLabels[mode] || mode;
      }
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: priority => (
        <Tag color="blue">{priority}</Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'status',
      width: 120,
      render: isActive => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Đang hoạt động' : 'Đã tắt'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa phản hồi tự động"
              description="Bạn có chắc chắn muốn xóa phản hồi tự động này?"
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
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={replies}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total, range) => `Tổng số ${total} phòng chat`
      }}
      onChange={onChange}
    />
  );
}

export default AutoReplyTable;
