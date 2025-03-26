import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, Upload, Button, Avatar, Space, Typography, message } from 'antd';
import { UploadOutlined, UserOutlined, LinkOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { convertFileToBase64, isBase64Image } from '../../utils/base64';

const { Text } = Typography;

function UserForm({ form, editingUser }) {
  const { user: currentUser } = useAuth();
  const isModerator = currentUser?.role === 'moderator';
  const [avatarUrl, setAvatarUrl] = useState('');

  // Set initial values when editingUser changes
  useEffect(() => {
    if (editingUser) {
      form.setFieldsValue({
        email: editingUser.email,
        username: editingUser.username,
        display_name: editingUser.display_name,
        role: editingUser.role,
        isActive: editingUser.is_active,
        avatar: editingUser.avatar
      });
      setAvatarUrl(editingUser.avatar);
    } else {
      form.resetFields();
      setAvatarUrl('');
    }
  }, [editingUser, form]);

  const getAvailableRoles = () => {
    if (currentUser?.role === 'owner') {
      return [
        { value: 'owner', label: 'Chủ sở hữu' },
        { value: 'admin', label: 'Quản trị viên' },
        { value: 'moderator', label: 'Điều hành viên' },
        { value: 'user', label: 'Người dùng' }
      ];
    }
    
    if (isModerator) {
      return [{ value: 'user', label: 'Người dùng' }];
    }

    return [
      { value: 'admin', label: 'Quản trị viên' },
      { value: 'moderator', label: 'Điều hành viên' },
      { value: 'user', label: 'Người dùng' }
    ];
  };

  React.useEffect(() => {
    if (isModerator) {
      form.setFieldValue('role', 'user');
    }
  }, [form, isModerator]);

  const handleFileChange = async ({ file }) => {
    try {
      if (!file) return;
      
      const base64 = await convertFileToBase64(file);
      setAvatarUrl(base64);
      form.setFieldsValue({ avatar: base64 });
    } catch (error) {
      message.error('Lỗi khi xử lý hình ảnh');
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setAvatarUrl(url);
    form.setFieldsValue({ avatar: url });
  };

  const handlePaste = async (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        await handleFileChange({ file });
        break;
      }
    }
  };

  const canEditRole = () => {
    if (currentUser?.role === 'owner') return true;
    if (isModerator) return false;
    if (editingUser?.role === 'owner') return false;
    if (editingUser?.role === 'admin' && currentUser?.role !== 'owner') return false;
    return true;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      validateTrigger="onSubmit"
      initialValues={{ 
        role: isModerator ? 'user' : 'user',
        isActive: true 
      }}
      onPaste={handlePaste}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Avatar
          size={100}
          src={avatarUrl}
          icon={<UserOutlined />}
          style={{ 
            backgroundColor: !avatarUrl ? '#1677ff' : 'transparent',
            border: '2px solid #f0f0f0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            marginBottom: '16px'
          }}
        />

        <Form.Item
          name="avatar"
          validateTrigger="onSubmit"
          rules={[
            { 
              required: true, 
              message: "Vui lòng nhập hoặc tải lên avatar!" 
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.reject();
                if (isBase64Image(value) || value.startsWith('http')) {
                  return Promise.resolve();
                }
                return Promise.reject('URL hoặc định dạng ảnh không hợp lệ!');
              }
            }
          ]}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleFileChange}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                hoặc dán (Ctrl+V) hình ảnh
              </Text>
            </Space>
            
            <Input 
              placeholder="Nhập URL avatar"
              value={avatarUrl}
              onChange={handleUrlChange}
              prefix={<LinkOutlined style={{ color: '#1677ff' }} />}
              allowClear
            />
          </Space>
        </Form.Item>
      </div>

      <Form.Item
        name="email"
        label="Email"
        validateTrigger="onSubmit"
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: "email", message: "Email không hợp lệ!" }
        ]}
      >
        <Input 
          placeholder="Nhập email" 
          disabled={editingUser}
        />
      </Form.Item>

      <Form.Item
        name="username"
        label="Tên đăng nhập"
        validateTrigger="onSubmit"
        rules={[
          { required: true, message: "Vui lòng nhập tên đăng nhập!" },
          { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" }
        ]}
      >
        <Input placeholder="Nhập tên đăng nhập" />
      </Form.Item>

      <Form.Item
        name="display_name"
        label="Tên hiển thị"
        validateTrigger="onSubmit"
        rules={[{ required: true, message: "Vui lòng nhập tên hiển thị!" }]}
      >
        <Input placeholder="Nhập tên hiển thị" />
      </Form.Item>

      {!editingUser && (
        <Form.Item
          name="password"
          label="Mật khẩu"
          validateTrigger="onSubmit"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>
      )}

      <Form.Item
        name="role"
        label="Vai trò"
        validateTrigger="onSubmit"
        rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
      >
        <Select 
          placeholder="Chọn vai trò"
          options={getAvailableRoles()}
          disabled={!canEditRole()}
        />
      </Form.Item>

      <Form.Item
        name="isActive"
        label="Trạng thái"
        valuePropName="checked"
      >
        <Switch 
          checkedChildren="Kích hoạt" 
          unCheckedChildren="Vô hiệu"
          disabled={editingUser?.role === 'owner' || (isModerator && editingUser && editingUser.role !== 'user')}
        />
      </Form.Item>
    </Form>
  );
}

export default UserForm;