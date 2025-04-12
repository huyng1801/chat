import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Space, Typography, message, Select, Radio } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { autoReplyService, chatService } from '../services';
import AutoReplyTable from '../components/auto-reply/AutoReplyTable';
import AutoReplyModal from '../components/auto-reply/AutoReplyModal';

const { Text } = Typography;
const { Option } = Select;

function AutoReplies() {
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [filterRoomId, setFilterRoomId] = useState(null);
  const [filterIsActive, setFilterIsActive] = useState(undefined);

  const fetchRooms = async () => {
    try {
      const response = await chatService.getRooms();
      setRooms(Array.isArray(response.rooms) ? response.rooms : []);
    } catch (error) {
      message.error('Không thể tải danh sách phòng chat');
      console.error("Fetch rooms error:", error);
    }
  };

  const fetchAutoReplies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterRoomId !== null) {
        params.roomId = filterRoomId;
      }
      if (filterIsActive !== undefined) {
        params.isActive = filterIsActive;
      }
      const data = await autoReplyService.getAutoReplies(params);
      setReplies(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Không thể tải danh sách phản hồi tự động');
      console.error("Fetch auto-replies error:", error);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }, [filterRoomId, filterIsActive]);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchAutoReplies();
  }, [fetchAutoReplies]);

  const handleSubmit = async (values) => {
    try {
      if (editingReply) {
        await autoReplyService.updateAutoReply(editingReply.id, values);
        message.success('Cập nhật phản hồi tự động thành công');
      } else {
        await autoReplyService.createAutoReply(values);
        message.success('Tạo phản hồi tự động thành công');
      }
      setIsModalVisible(false);
      setEditingReply(null);
      fetchAutoReplies();
      return true;
    } catch (error) {
      message.error(error.message || 'Không thể lưu phản hồi tự động');
      return false;
    }
  };

  const handleDelete = async (id) => {
    try {
      await autoReplyService.deleteAutoReply(id);
      message.success('Xóa phản hồi tự động thành công');
      fetchAutoReplies();
    } catch (error) {
      message.error(error.message || 'Không thể xóa phản hồi tự động');
    }
  };

  const handleModalOpen = (reply = null) => {
    setEditingReply(reply);
    setIsModalVisible(true);
  }

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingReply(null);
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <Text strong style={{ fontSize: '20px' }}>Quản lý phản hồi tự động</Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleModalOpen()}
        >
          Thêm phản hồi
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Space wrap align="center" size="middle">
          <Text>Lọc theo:</Text>
          <Select
            showSearch
            allowClear
            style={{ width: 200 }}
            placeholder="Chọn phòng chat"
            optionFilterProp="children"
            value={filterRoomId}
            onChange={(value) => setFilterRoomId(value === undefined ? null : value)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option value={null} label="Tất cả phòng">-- Tất cả phòng --</Option>
            {rooms.map(room => (
              <Option key={room.id} value={room.id} label={room.name}>
                {room.name}
              </Option>
            ))}
          </Select>

          <Radio.Group
            value={filterIsActive}
            onChange={(e) => setFilterIsActive(e.target.value)}
          >
            <Radio value={undefined}>Tất cả trạng thái</Radio>
            <Radio value={true}>Đang hoạt động</Radio>
            <Radio value={false}>Không hoạt động</Radio>
          </Radio.Group>
        </Space>
      </Card>

      <Card>
        <AutoReplyTable
          loading={loading}
          replies={replies}
          onEdit={handleModalOpen}
          onDelete={handleDelete}
        />
      </Card>

      <AutoReplyModal
        visible={isModalVisible}
        onCancel={handleModalClose}
        onSubmit={handleSubmit}
        reply={editingReply}
        rooms={rooms}
      />
    </div>
  );
}

export default AutoReplies;
