import React, { useState, useEffect } from 'react';
import { Card, Switch, Typography, message, Space, Alert } from 'antd';
import { useAuth } from '../context/AuthContext';
import { settingService } from '../services';

const { Title, Text } = Typography;

function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    enable_private_chat: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingService.getSettings();
      setSettings({
        enable_private_chat: data.enable_private_chat === 'true'
      });
    } catch (error) {
      message.error('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrivateChat = async (checked) => {
    try {
      setLoading(true);
      await settingService.updateSetting('enable_private_chat', checked.toString());
      setSettings(prev => ({
        ...prev,
        enable_private_chat: checked
      }));
      message.success('Cập nhật cài đặt thành công');
    } catch (error) {
      message.error('Không thể cập nhật cài đặt');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'owner') {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          type="error"
          message="Truy cập bị từ chối"
          description="Bạn không có quyền truy cập trang này. Chỉ chủ sở hữu mới có thể quản lý cài đặt hệ thống."
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Cài đặt hệ thống</Title>

      <Card title="Cài đặt trò chuyện">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Space direction="vertical" size={0}>
              <Text strong>Chat riêng tư</Text>
              <Text type="secondary">
                Cho phép người dùng nhắn tin riêng tư với nhau
              </Text>
            </Space>
            <Switch
              checked={settings.enable_private_chat}
              onChange={handleTogglePrivateChat}
              loading={loading}
            />
          </div>

          <Alert
            message="Lưu ý về chat riêng tư"
            description={
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Khi tắt tính năng này, người dùng sẽ không thể bắt đầu cuộc trò chuyện mới</li>
                <li>Các cuộc trò chuyện hiện có vẫn được giữ nguyên</li>
                <li>Chỉ chủ sở hữu mới có thể thay đổi cài đặt này</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
}

export default Settings;