import React from 'react';
import { Form, Input } from 'antd';

function ChatRoomForm({ form }) {
  return (
    <Form
      form={form}
      layout="vertical"
    >
      <Form.Item
        name="name"
        label="Tên phòng"
        rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
      >
        <Input placeholder="Nhập tên phòng chat" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
      >
        <Input.TextArea 
          rows={3} 
          placeholder="Nhập mô tả cho phòng chat"
        />
      </Form.Item>
    </Form>
  );
}

export default ChatRoomForm;