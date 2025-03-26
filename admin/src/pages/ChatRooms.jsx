import React, { useState, useEffect } from 'react';
import { Card, Button, Input, message, Typography, Space, Form, Modal } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  NotificationOutlined,
  BellOutlined 
} from '@ant-design/icons';
import { chatService } from '../services';
import ChatRoomTable from '../components/chat-room/ChatRoomTable';
import ChatRoomForm from '../components/chat-room/ChatRoomForm';
import ChatRoomDetails from '../components/chat-room/ChatRoomDetails';
import AnnouncementModal from '../components/chat-room/AnnouncementModal';
import AnnouncementManagerModal from '../components/chat-room/AnnouncementManagerModal';
import debounce from 'lodash/debounce';

const { Text } = Typography;

function ChatRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAnnouncementModalVisible, setIsAnnouncementModalVisible] = useState(false);
  const [isAnnouncementManagerVisible, setIsAnnouncementManagerVisible] = useState(false);
  const [form] = Form.useForm();

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchRooms = async (params = filters) => {
    setLoading(true);
    try {
      const data = await chatService.getRooms(params);
      setRooms(data.rooms);
      setPagination({
        current: data.pagination.page,
        pageSize: data.pagination.limit,
        total: data.pagination.total
      });
    } catch (error) {
      message.error('Không thể tải danh sách phòng chat');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = debounce((value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  }, 500);

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedRoom) {
        await chatService.updateRoom(selectedRoom.id, values);
        message.success('Cập nhật phòng chat thành công');
      } else {
        await chatService.createRoom(values);
        message.success('Tạo phòng chat thành công');
      }
      
      setIsModalVisible(false);
      setSelectedRoom(null);
      form.resetFields();
      fetchRooms();
    } catch (error) {
      message.error(error.message || 'Lỗi khi lưu phòng chat');
    }
  };

  const handleDelete = async (id) => {
    try {
      await chatService.deleteRoom(id);
      message.success('Xóa phòng chat thành công');
      fetchRooms();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleViewDetails = async (room) => {
    try {
      const details = await chatService.getRoom(room.id);
      setRoomDetails(details);
      setDetailsVisible(true);
    } catch (error) {
      message.error('Không thể tải thông tin chi tiết phòng chat');
    }
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    setSelectedRows([]);
  };

  const handleCreateAnnouncement = () => {
    if (selectedRows.length === 0) {
      message.warning('Vui lòng chọn ít nhất một phòng chat');
      return;
    }
    setIsAnnouncementModalVisible(true);
  };

  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys) => {
      setSelectedRows(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: false, // Enable selection for all rooms
      name: record.name,
    }),
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <Text strong style={{ fontSize: '20px' }}>Danh sách phòng chat</Text>
        <Space>
          <Button
            icon={<BellOutlined />}
            onClick={() => setIsAnnouncementManagerVisible(true)}
          >
            Quản lý thông báo
          </Button>
          <Button
            icon={<NotificationOutlined />}
            onClick={handleCreateAnnouncement}
            disabled={selectedRows.length === 0}
          >
            Tạo thông báo ({selectedRows.length})
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setSelectedRoom(null);
              setIsModalVisible(true);
            }}
          >
            Tạo phòng chat
          </Button>
        </Space>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="Tìm kiếm..."
              allowClear
              prefix={<SearchOutlined />}
              onChange={e => debouncedSearch(e.target.value)}
              style={{ width: 200 }}
            />
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleReset}
            >
              Đặt lại
            </Button>
          </Space>
        </div>

        <ChatRoomTable
          rooms={rooms}
          loading={loading}
          onEdit={(room) => {
            setSelectedRoom(room);
            form.setFieldsValue(room);
            setIsModalVisible(true);
          }}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          pagination={pagination}
          onChange={({ page, pageSize }) => {
            setFilters(prev => ({
              ...prev,
              page,
              limit: pageSize
            }));
          }}
          rowSelection={rowSelection}
        />
      </Card>

      <Modal
        title={selectedRoom ? 'Chỉnh sửa phòng chat' : 'Tạo phòng chat mới'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedRoom(null);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <ChatRoomForm form={form} />
      </Modal>

      <ChatRoomDetails
        room={roomDetails}
        visible={detailsVisible}
        onClose={() => {
          setDetailsVisible(false);
          setRoomDetails(null);
        }}
      />

      <AnnouncementModal
        visible={isAnnouncementModalVisible}
        onClose={() => {
          setIsAnnouncementModalVisible(false);
          setSelectedRows([]);
        }}
        selectedRooms={selectedRows}
        rooms={rooms}
      />

      <AnnouncementManagerModal
        visible={isAnnouncementManagerVisible}
        onClose={() => setIsAnnouncementManagerVisible(false)}
      />
    </div>
  );
}

export default ChatRooms;