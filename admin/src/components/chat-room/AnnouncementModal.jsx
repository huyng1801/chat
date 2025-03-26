import React, { useState } from 'react';
import { Modal, Form, Input, Select, message, Typography, Table } from 'antd';
import { announcementService } from '../../services';

const { TextArea } = Input;
const { Text } = Typography;

function AnnouncementModal({ visible, onClose, selectedRooms, rooms }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Create announcements for each selected room
      await Promise.all(selectedRooms.map(roomId => {
        return announcementService.createAnnouncement({
          roomId: roomId,
          content: values.content,
          schedule: values.schedule,
          is_active: true
        });
      }));

      message.success('Tạo thông báo thành công');
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error.message || 'Không thể tạo thông báo');
    } finally {
      setLoading(false);
    }
  };

  const scheduleOptions = [
    {
      label: 'Hàng ngày',
      options: [
        { value: '*/5 * * * *', label: 'Mỗi 5 phút' },
        { value: '0 */4 * * *', label: '4 giờ một lần' },
        { value: '0 9 * * *', label: 'Mỗi ngày lúc 9:00' },
        { value: '0 12 * * *', label: 'Mỗi ngày lúc 12:00' },
        { value: '0 15 * * *', label: 'Mỗi ngày lúc 15:00' },
        { value: '0 18 * * *', label: 'Mỗi ngày lúc 18:00' }
      ]
    },
    {
      label: 'Hàng tuần',
      options: [
        { value: '0 9 * * 1', label: 'Thứ 2 hàng tuần lúc 9:00' },
        { value: '0 9 * * 3', label: 'Thứ 4 hàng tuần lúc 9:00' },
        { value: '0 9 * * 5', label: 'Thứ 6 hàng tuần lúc 9:00' }
      ]
    },
    {
      label: 'Hàng tháng',
      options: [
        { value: '0 9 1 * *', label: 'Ngày 1 hàng tháng lúc 9:00' },
        { value: '0 9 15 * *', label: 'Ngày 15 hàng tháng lúc 9:00' }
      ]
    }
  ];

  // Selected rooms table columns
  const columns = [
    {
      title: 'Tên phòng',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Số thành viên',
      dataIndex: 'member_count',
      key: 'member_count'
    }
  ];

  // Get selected room data
  const selectedRoomData = rooms
    .filter(room => selectedRooms.includes(room.id))
    .map(room => ({
      key: room.id,
      name: room.name,
      member_count: room.member_count || 0
    }));

  return (
    <Modal
      title="Tạo thông báo"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Hủy"
      width={800}
    >
      <div style={{ marginBottom: '24px' }}>
        <Text strong>Phòng chat được chọn ({selectedRooms.length})</Text>
        <Table
          columns={columns}
          dataSource={selectedRoomData}
          pagination={false}
          size="small"
          style={{ marginTop: '12px' }}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="content"
          label="Nội dung thông báo"
          rules={[
            { required: true, message: 'Vui lòng nhập nội dung thông báo' },
            { max: 1000, message: 'Nội dung không được vượt quá 1000 ký tự' }
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="Nhập nội dung thông báo" 
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item
          name="schedule"
          label="Lịch thông báo"
          rules={[{ required: true, message: 'Vui lòng chọn lịch thông báo' }]}
          help="Chọn thời điểm thông báo sẽ được gửi tự động"
        >
          <Select
            placeholder="Chọn lịch thông báo"
            options={scheduleOptions}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>

      <div style={{ marginTop: '16px' }}>
        <Text type="secondary">
          Lưu ý: Thông báo sẽ được gửi tự động theo lịch đã chọn và hiển thị trong phòng chat như một tin nhắn hệ thống.
        </Text>
      </div>
    </Modal>
  );
}

export default AnnouncementModal;