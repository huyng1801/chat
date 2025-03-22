
import React from 'react';
import { Button, Input, Tooltip, Upload, Typography } from 'antd';
import { SendOutlined, FileImageOutlined, SmileOutlined, FileOutlined } from '@ant-design/icons';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const { Text } = Typography;

function ChatInput({ 
  newMessage, 
  setNewMessage, 
  handleSendMessage, 
  handleFileUpload, 
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiSelect,
  disabled = false,
  banInfo = null
}) {
  const getBanMessage = () => {
    if (!banInfo) return null;
    
    const expiresAt = new Date(banInfo.expires_at);
    const now = new Date();
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) return null;

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `Bạn đã bị cấm chat. Thời gian còn lại: ${hours}h ${minutes}m`;
  };

  const banMessage = getBanMessage();
  const isBanned = !!banMessage;

  return (
    <div style={{ 
      borderTop: '1px solid #f0f0f0',
      padding: '16px',
      background: '#fff'
    }}>
      {isBanned && (
        <div style={{ 
          marginBottom: '8px',
          padding: '8px',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '4px'
        }}>
          <Text type="danger">{banMessage}</Text>
          {banInfo.reason && (
            <div style={{ marginTop: '4px', fontSize: '12px' }}>
              <Text type="secondary">Lý do: {banInfo.reason}</Text>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            handleFileUpload(file, 'image');
            return false;
          }}
          disabled={disabled || isBanned}
        >
          <Tooltip title={isBanned ? 'Bạn đã bị cấm chat' : 'Gửi hình ảnh'}>
            <Button
              icon={<FileImageOutlined />}
              disabled={disabled || isBanned}
            />
          </Tooltip>
        </Upload>

        <Upload
          showUploadList={false}
          beforeUpload={(file) => {
            handleFileUpload(file, 'file');
            return false;
          }}
          disabled={disabled || isBanned}
        >
          <Tooltip title={isBanned ? 'Bạn đã bị cấm chat' : 'Gửi tệp'}>
            <Button
              icon={<FileOutlined />}
              disabled={disabled || isBanned}
            />
          </Tooltip>
        </Upload>
        
        <Tooltip title={isBanned ? 'Bạn đã bị cấm chat' : 'Chèn emoji'}>
          <Button
            icon={<SmileOutlined />}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled || isBanned}
          />
        </Tooltip>
        
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder={isBanned ? 'Bạn đã bị cấm chat' : 'Nhập tin nhắn...'}
          disabled={disabled || isBanned}
          size="large"
        />
        
        <Tooltip title={isBanned ? 'Bạn đã bị cấm chat' : 'Gửi tin nhắn'}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={disabled || isBanned || !newMessage.trim()}
            size="large"
          />
        </Tooltip>
      </div>
      
      {showEmojiPicker && !isBanned && (
        <div style={{ 
          position: 'absolute', 
          bottom: '80px', 
          right: '24px', 
          zIndex: 1000 
        }}>
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
          />
        </div>
      )}
    </div>
  );
}

export default ChatInput;
