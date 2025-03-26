import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, List, Avatar, Space, Typography, Tag, Empty, Badge, Spin } from 'antd';
import { UserOutlined, MessageOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { userService } from '../../services';

const { Text } = Typography;

function ChatRoomDetails({ room, visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (room?.members && visible) {
      fetchMemberDetails();
    }
  }, [room, visible]);

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const memberDetails = await Promise.all(
        room.members.map(async (member) => {
          const userData = await userService.getUser(member.id);
          return {
            ...userData,
            role: member.RoomMember.role,
            joined_at: member.RoomMember.created_at
          };
        })
      );
      setMembers(memberDetails);
    } catch (error) {
      console.error('Error fetching member details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return 'Không xác định';
    }
  };

  if (!room) return null;

  return (
    <Modal
      title={`Chi tiết phòng ${room.name}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions column={2} bordered>
        <Descriptions.Item label="Tên phòng" span={2}>
          {room.name}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={2}>
          {room.description || 'Không có mô tả'}
        </Descriptions.Item>
        <Descriptions.Item label="Người tạo">
          {room.creator_name}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {formatDate(room.created_at)}
        </Descriptions.Item>
        <Descriptions.Item label="Số thành viên">
          {room.member_count || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Số tin nhắn">
          {room.message_count || 0}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        <Text strong>Thành viên</Text>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : members.length > 0 ? (
          <List
            dataSource={members}
            renderItem={member => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      src={member.avatar} 
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: !member.avatar ? '#1677ff' : 'transparent'
                      }}
                    />
                  }
                  title={
                    <Space>
                      <Text>{member.display_name || member.username}</Text>
                      <Tag color={member.role === 'moderator' ? 'orange' : 'green'}>
                        {member.role === 'moderator' ? 'Điều hành viên' : 'Thành viên'}
                      </Tag>
                      <Badge 
                        status={member.status === 'online' ? 'success' : 'default'}
                        text={member.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                      />
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">
                        Email: {member.email}
                      </Text>
                      <Text type="secondary">
                        Tham gia: {formatDate(member.joined_at)}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Chưa có thành viên nào" />
        )}
      </div>
    </Modal>
  );
}

export default ChatRoomDetails;