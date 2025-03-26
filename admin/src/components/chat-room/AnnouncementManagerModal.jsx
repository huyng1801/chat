import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Space, Tag, Typography, Popconfirm, message } from 'antd';
import { DeleteOutlined, EditOutlined, NotificationOutlined } from '@ant-design/icons';
import { announcementService } from '../../services';
import AnnouncementForm from './AnnouncementForm';

const { Text } = Typography;

function AnnouncementManagerModal({ visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAnnouncements();
    }
  }, [visible]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await announcementService.deleteAnnouncement(id);
      message.success('Xóa thông báo thành công');
      fetchAnnouncements();
    } catch (error) {
      message.error('Không thể xóa thông báo');
    }
  };

  const handleEdit = (record) => {
    setEditingAnnouncement(record);
    setShowForm(true);
  };

  const handleFormSubmit = async () => {
    await fetchAnnouncements();
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const scheduleLabels = {
    '0 */4 * * *': '4 giờ một lần',
    '0 9 * * *': 'Mỗi ngày lúc 9:00',
    '0 12 * * *': 'Mỗi ngày lúc 12:00',
    '0 15 * * *': 'Mỗi ngày lúc 15:00',
    '0 18 * * *': 'Mỗi ngày lúc 18:00',
    '0 9 * * 1': 'Thứ 2 hàng tuần lúc 9:00',
    '0 9 * * 3': 'Thứ 4 hàng tuần lúc 9:00',
    '0 9 * * 5': 'Thứ 6 hàng tuần lúc 9:00',
    '0 9 1 * *': 'Ngày 1 hàng tháng lúc 9:00',
    '0 9 15 * *': 'Ngày 15 hàng tháng lúc 9:00'
  };

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: '40%',
      render: (text) => (
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
      render: (room) => room ? room.name : 'Tất cả phòng'
    },
    {
      title: 'Lịch thông báo',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule) => scheduleLabels[schedule] || schedule
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'status',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Đang hoạt động' : 'Đã tắt'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa thông báo"
            description="Bạn có chắc chắn muốn xóa thông báo này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <NotificationOutlined />
          <span>Quản lý thông báo</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      style={{ top: 20 }}
    >

      <Table
        columns={columns}
        dataSource={announcements}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ y: 'calc(100vh - 300px)' }}
      />

      <AnnouncementForm
        visible={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAnnouncement(null);
        }}
        onSubmit={handleFormSubmit}
        announcement={editingAnnouncement}
      />
    </Modal>
  );
}

export default AnnouncementManagerModal;