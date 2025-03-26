import React from 'react';
import { Modal, Form } from 'antd';
import UserForm from './UserForm';

function UserModal({ 
  visible, 
  editingUser, 
  onCancel, 
  onSubmit 
}) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const success = await onSubmit(values, editingUser);
      if (success) {
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="Lưu"
      cancelText="Hủy"
    >
      <UserForm 
        form={form}
        editingUser={editingUser}
      />
    </Modal>
  );
}

export default UserModal;