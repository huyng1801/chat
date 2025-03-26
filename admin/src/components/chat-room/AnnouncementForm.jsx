import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { announcementService } from '../../services';

const { TextArea } = Input;

function AnnouncementForm({ visible, onClose, onSubmit, announcement }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && announcement) {
      form.setFieldsValue(announcement);
    } else {
      form.resetFields();
    }
  }, [visible, announcement, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (announcement) {
        await announcementService.updateAnnouncement(announcement.id, values);
        message.success('Cập nhật thông báo thành công');
      }

      onSubmit();
    } catch (error) {
      message.error(error.message || 'Không thể lưu thông báo');
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

  return (
    <Modal
      title={announcement ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      width={800}
      okText={announcement ? 'Cập nhật' : 'Tạo'}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          is_active: true
        }}
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
            rows={6} 
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

        <Form.Item
          name="is_active"
          label="Trạng thái"
          valuePropName="checked"
        >
          <Switch 
            checkedChildren="Đang hoạt động" 
            unCheckedChildren="Đã tắt"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AnnouncementForm;