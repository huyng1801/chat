import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Button, Space, Tag, Typography, Popconfirm, message, Input, AutoComplete } from 'antd';
import { DeleteOutlined, EditOutlined, NotificationOutlined, PlusOutlined } from '@ant-design/icons';
import { announcementService } from '../../services';
import AnnouncementForm from './AnnouncementForm';

const { Text } = Typography;

function AnnouncementManagerModal({ visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestionOptions, setSuggestionOptions] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // State for selected row keys

  useEffect(() => {
    if (visible) {
      fetchAnnouncements();
      setSearchTerm('');
      setSuggestionOptions([]);
      setSelectedRowKeys([]); // Reset selection when modal opens
    }
  }, [visible]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Không thể tải danh sách thông báo');
      console.error("Fetch announcements error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await announcementService.deleteAnnouncement(id);
      message.success('Xóa thông báo thành công');
      setSelectedRowKeys(prevKeys => prevKeys.filter(key => key !== id)); // Remove deleted key if selected
      await fetchAnnouncements();
    } catch (error) {
      message.error('Không thể xóa thông báo');
      console.error("Delete announcement error:", error);
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một thông báo để xóa.');
      return;
    }
    try {
      setLoading(true);
      for (const id of selectedRowKeys) {
        await announcementService.deleteAnnouncement(id);
      }
      message.success(`Đã xóa ${selectedRowKeys.length} thông báo thành công`);
      setSelectedRowKeys([]); 
      await fetchAnnouncements();
    } catch (error) {
      message.error('Đã xảy ra lỗi khi xóa các thông báo đã chọn');
      console.error("Delete selected announcements error:", error);
    } finally {
      setLoading(false);
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

  const handleFormClose = () => {
      setShowForm(false);
      setEditingAnnouncement(null);
  }

  const scheduleLabels = {
    '*/5 * * * *': 'Mỗi 5 phút',
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

  const uniqueRoomNames = useMemo(() => {
    const names = new Set();
    announcements.forEach(ann => {
        names.add(ann.room ? ann.room.name : 'Tất cả phòng');
    });
    return Array.from(names).map(name => ({ value: name, label: name }));
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    if (!searchTerm) {
      return announcements;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    return announcements.filter(announcement => {
      const roomName = announcement.room ? announcement.room.name : 'Tất cả phòng';
      return roomName.toLowerCase().includes(lowerCaseSearchTerm);
    });
  }, [announcements, searchTerm]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (!value) {
      setSuggestionOptions([]);
    } else {
      const lowerCaseValue = value.toLowerCase().trim();
      const filteredOptions = uniqueRoomNames.filter(option =>
        option.label.toLowerCase().includes(lowerCaseValue)
      );
      setSuggestionOptions(filteredOptions);
    }
  };

  const handleSelect = (value) => {
    setSearchTerm(value);
    setSuggestionOptions([]);
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const hasSelected = selectedRowKeys.length > 0;

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: '45%',
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
      width: '20%',
      render: (room) => room ? room.name : <Tag>Tất cả phòng</Tag>
    },
    {
      title: 'Lịch thông báo',
      dataIndex: 'schedule',
      key: 'schedule',
      width: '15%',
      render: (schedule) => scheduleLabels[schedule] || schedule
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'status',
      width: '10%',
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
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
            disabled={hasSelected} // Disable individual actions when multi-selecting
          />
          <Popconfirm
            title="Xóa thông báo"
            description="Bạn có chắc chắn muốn xóa thông báo này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
            disabled={hasSelected} // Disable individual actions when multi-selecting
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Xóa"
              disabled={hasSelected} // Disable individual actions when multi-selecting
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
      width={1366}
      style={{ top: 20 }}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
         <Space wrap>
            <AutoComplete
                value={searchTerm}
                options={suggestionOptions}
                style={{ width: 300 }}
                onSelect={handleSelect}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm theo tên phòng chat..."
            >
                <Input.Search allowClear />
            </AutoComplete>

            <Popconfirm
                title={`Xóa ${selectedRowKeys.length} thông báo đã chọn?`}
                description="Hành động này không thể hoàn tác."
                onConfirm={handleDeleteSelected}
                okText="Đồng ý"
                cancelText="Hủy"
                disabled={!hasSelected}
            >
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={!hasSelected}
                    loading={loading && hasSelected} // Show loading only on this button when deleting selected
                >
                    Xóa mục đã chọn ({selectedRowKeys.length})
                </Button>
            </Popconfirm>

         </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredAnnouncements}
        rowKey="id"
        loading={loading && !hasSelected} // Show general loading only when not deleting selected
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
        scroll={{ y: 'calc(100vh - 350px)' }} // Adjust scroll height if needed
        bordered
        size="small"
      />

      <AnnouncementForm
        visible={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        announcement={editingAnnouncement}
      />
    </Modal>
  );
}

export default AnnouncementManagerModal;