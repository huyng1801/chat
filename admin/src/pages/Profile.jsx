import React, { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Space, Tooltip, Typography } from 'antd';
import { UserOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { convertFileToBase64, isBase64Image } from '../utils/base64';

const { Text } = Typography;

function Profile() {
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [imagePreview, setImagePreview] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar
      });
      setImagePreview(user.avatar);
    }
  }, [user, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log(values);
      await updateUser({
        username: values.username,
        displayName: values.display_name,
        avatar: values.avatar
      });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async ({ file }) => {
    try {
      if (!file) return;
      
      const base64 = await convertFileToBase64(file);
      setImagePreview(base64);
      form.setFieldsValue({ avatar: base64 });
    } catch (error) {
      message.error('Lỗi khi xử lý hình ảnh');
    }
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

  const handleAvatarUrlChange = (e) => {
    const url = e.target.value;
    setImagePreview(url);
    form.setFieldsValue({ avatar: url });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Thông tin cá nhân" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Avatar
            size={100}
            src={imagePreview}
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: !imagePreview ? '#1677ff' : 'transparent',
              border: '2px solid #f0f0f0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              marginBottom: '16px'
            }}
          />
          
          <Space direction="vertical" size="small">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleFileChange}
            >
              <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
            </Upload>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              hoặc dán (Ctrl+V) hình ảnh trực tiếp
            </Text>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onPaste={handlePaste}
        >
          <Form.Item
            name="email"
            label="Email"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên người dùng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên người dùng' },
              { min: 3, message: 'Tên người dùng phải có ít nhất 3 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên người dùng" />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="Tên hiển thị"
            rules={[
              { required: true, message: 'Vui lòng nhập tên hiển thị' }
            ]}
          >
            <Input placeholder="Nhập tên hiển thị" />
          </Form.Item>

          <Form.Item
            name="avatar"
            label={
              <Space>
                <span>URL Avatar</span>
                <Tooltip title="Bạn có thể nhập URL hình ảnh hoặc tải lên/dán hình ảnh">
                  <LinkOutlined style={{ color: '#1677ff' }} />
                </Tooltip>
              </Space>
            }
            rules={[
              { required: true, message: 'Vui lòng nhập hoặc tải lên avatar!' },
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
            <Input 
              placeholder="Nhập URL avatar hoặc tải lên ảnh" 
              value={imagePreview}
              onChange={handleAvatarUrlChange}
              prefix={<LinkOutlined style={{ color: '#1677ff' }} />}
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={loading}
            >
              Cập nhật thông tin
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Profile;