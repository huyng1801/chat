import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, Space } from 'antd';
import { chatService } from '../../services';

const { TextArea } = Input;

function AutoReplyModal({ visible, onCancel, onSubmit, reply }) {
  const [form] = Form.useForm();
  const [rooms, setRooms] = React.useState([]);

  useEffect(() => {
    if (visible) {
      fetchRooms();
      if (reply) {
        form.setFieldsValue({
          ...reply,
          matchMode: reply.match_mode,
          roomId: reply.room_id,
          isActive: reply.is_active
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          matchMode: 'contains',
          priority: 0,
          isActive: true
        });
      }
    }
  }, [visible, reply, form]);

  const fetchRooms = async () => {
    try {
      const data = await chatService.getRooms();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      return await onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  };

  return (
    <Modal
      title={reply ? "Chỉnh sửa phản hồi tự động" : "Thêm phản hồi tự động"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={800}
      okText={reply ? "Cập nhật" : "Thêm"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="roomId"
          label="Phòng chat"
          help="Để trống để áp dụng cho tất cả các phòng"
        >
          <Select
            allowClear
            placeholder="Chọn phòng chat"
            options={rooms.map(room => ({
              value: room.id,
              label: room.name
            }))}
          />
        </Form.Item>

        <Form.Item
          name="keyword"
          label="Từ khóa"
          rules={[
            { required: true, message: 'Vui lòng nhập từ khóa' }
          ]}
        >
          <Input placeholder="Nhập từ khóa" />
        </Form.Item>

        <Form.Item
          name="response"
          label="Phản hồi"
          rules={[
            { required: true, message: 'Vui lòng nhập phản hồi' }
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="Nhập nội dung phản hồi"
          />
        </Form.Item>

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Form.Item
            name="matchMode"
            label="Chế độ khớp"
            rules={[
              { required: true, message: 'Vui lòng chọn chế độ khớp' }
            ]}
          >
            <Select style={{ width: 200 }}>
              <Select.Option value="exact">Chính xác</Select.Option>
              <Select.Option value="contains">Chứa từ khóa</Select.Option>
              <Select.Option value="starts_with">Bắt đầu bằng</Select.Option>
              <Select.Option value="ends_with">Kết thúc bằng</Select.Option>
              <Select.Option value="regex">Biểu thức chính quy</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            rules={[
              { required: true, message: 'Vui lòng nhập độ ưu tiên' }
            ]}
          >
            <InputNumber min={0} max={100} />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Đang hoạt động" 
              unCheckedChildren="Đã tắt"
            />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
}

export default AutoReplyModal;