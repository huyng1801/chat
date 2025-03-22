
import React, { useState, useEffect } from 'react';
import { List, Avatar, Space, Typography, Tag, Badge, Button, Tooltip, Modal, message, Dropdown, Tabs, Radio, Input } from 'antd';
import { 
  UserOutlined, 
  CloseOutlined,
  DeleteOutlined,
  StopOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  MoreOutlined,
  CheckOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { userService, chatService } from '../../services';

const { Text } = Typography;
const { TabPane } = Tabs;

function RoomDetails({ 
  room,
  onClose,
  onKickMember,
  onBanUser,
  onChangeRole,
  currentUser,
  isModerator 
}) {
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

  const isCreator = room?.created_by === currentUser?.id;
  const canManage = isCreator || isModerator;

  // Reset state when room changes
  useEffect(() => {
    if (room?.id) {
      setMembers([]);
      setPendingMembers([]);
      setLoading(true);
      fetchMembersDetails();
      fetchPendingMembers();
    }
  }, [room]);

  const fetchMembersDetails = async () => {
    if (!room?.id) return;
    
    try {
      const memberDetails = await Promise.all(
        (room.members || []).map(async (member) => {
          const userDetails = await userService.getUser(member.id);
          return {
            ...userDetails,
            RoomMember: member.RoomMember
          };
        })
      );
      setMembers(memberDetails);
    } catch (error) {
      message.error('Không thể tải thông tin thành viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingMembers = async () => {
    if (!room?.id) return;

    try {
      const data = await chatService.getPendingMembers(room.id);
      setPendingMembers(data || []);
    } catch (error) {
      message.error('Không thể tải danh sách yêu cầu tham gia');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'HH:mm dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return '';
    }
  };

  const handleAcceptMember = async (userId) => {
    try {
      await chatService.acceptMember(room.id, userId);
      message.success('Đã chấp nhận thành viên');
      
      // Update both member lists
      await Promise.all([
        fetchPendingMembers(),
        fetchMembersDetails()
      ]);
    } catch (error) {
      message.error('Không thể chấp nhận thành viên');
    }
  };

  const handleRejectMember = async (userId) => {
    try {
      await chatService.rejectMember(room.id, userId);
      message.success('Đã từ chối thành viên');
      await fetchPendingMembers();
    } catch (error) {
      message.error('Không thể từ chối thành viên');
    }
  };

  const handleKickMember = (memberId) => {
    Modal.confirm({
      title: 'Xác nhận kick thành viên',
      content: 'Bạn có chắc chắn muốn kick thành viên này khỏi phòng chat?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        await onKickMember(room.id, memberId);
        // Update member list after successful kick
        await fetchMembersDetails();
      }
    });
  };

  const handleBanUser = (userId) => {
    Modal.confirm({
      title: 'Cấm thành viên',
      content: (
        <div>
          <p>Chọn thời gian cấm:</p>
          <Radio.Group defaultValue="1h">
            <Space direction="vertical">
              <Radio value="1h">1 giờ</Radio>
              <Radio value="6h">6 giờ</Radio>
              <Radio value="12h">12 giờ</Radio>
              <Radio value="24h">24 giờ</Radio>
              <Radio value="7d">7 ngày</Radio>
              <Radio value="30d">30 ngày</Radio>
            </Space>
          </Radio.Group>
          <Input.TextArea
            placeholder="Lý do cấm (không bắt buộc)"
            style={{ marginTop: '16px' }}
          />
        </div>
      ),
      okText: 'Cấm',
      cancelText: 'Hủy',
      onOk: async (close) => {
        const duration = document.querySelector('.ant-radio-wrapper-checked input')?.value || '1h';
        const reason = document.querySelector('.ant-input')?.value;
        
        await onBanUser(room.id, userId, duration, reason);
        // Update member list after successful ban
        await fetchMembersDetails();
        close();
      }
    });
  };

  const handleChangeRole = (memberId, newRole) => {
    if (!isCreator) {
      message.error('Chỉ người tạo phòng mới có thể thay đổi vai trò thành viên');
      return;
    }

    Modal.confirm({
      title: `Xác nhận ${newRole === 'moderator' ? 'thăng cấp' : 'hạ cấp'} thành viên`,
      content: `Bạn có chắc chắn muốn ${newRole === 'moderator' ? 'thăng cấp thành điều hành viên' : 'hạ cấp xuống thành viên thường'}?`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        await onChangeRole(room.id, memberId, newRole);
        // Update member list after role change
        await fetchMembersDetails();
      }
    });
  };

  const getMemberActions = (member) => {
    const isMemberModerator = member.RoomMember?.role === 'moderator';
    const canBeManaged = canManage && 
                        member.id !== currentUser?.id && 
                        member.id !== room.created_by &&
                        (!isMemberModerator || isCreator);

    if (!canBeManaged) return [];

    const items = [
      isCreator && {
        key: 'role',
        label: isMemberModerator ? 'Hạ cấp thành viên' : 'Thăng cấp điều hành',
        icon: <UserSwitchOutlined />,
        onClick: () => handleChangeRole(
          member.id, 
          isMemberModerator ? 'member' : 'moderator'
        )
      },
      {
        key: 'kick',
        label: 'Kick khỏi phòng',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleKickMember(member.id)
      },
      {
        key: 'ban',
        label: 'Cấm khỏi phòng',
        icon: <StopOutlined />,
        danger: true,
        onClick: () => handleBanUser(member.id)
      }
    ].filter(Boolean);

    return [
      <Dropdown
        key="more"
        menu={{ items }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          style={{ float: 'right' }}
        />
      </Dropdown>
    ];
  };

  if (!room) return null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text strong>Chi tiết phòng chat</Text>
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={onClose}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ padding: '0 16px' }}
        >
          <TabPane 
            tab={`Thành viên (${members.length})`} 
            key="members"
          >
            <List
              loading={loading}
              dataSource={members}
              renderItem={member => (
                <List.Item
                  style={{ padding: '12px 0' }}
                  actions={getMemberActions(member)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={36}
                        src={member.avatar} 
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: !member.avatar ? '#1677ff' : 'transparent'
                        }}
                      />
                    }
                    title={
                      <Space size={4}>
                        <Text>{member.display_name || member.username}</Text>
                        {member.id === room.created_by && (
                          <Tag icon={<CrownOutlined />} color="gold" style={{ margin: 0 }}>
                            Người tạo
                          </Tag>
                        )}
                        {member.RoomMember?.role === 'moderator' && member.id !== room.created_by && (
                          <Tag color="orange" style={{ margin: 0 }}>
                            Điều hành viên
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0} style={{ lineHeight: '1.2' }}>
                        <Badge 
                          status={member.status === 'online' ? 'success' : 'default'}
                          text={
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {member.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                            </Text>
                          }
                        />
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          Tham gia: {formatDate(member.RoomMember?.created_at)}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          {canManage && (
            <TabPane 
              tab={`Yêu cầu tham gia (${pendingMembers.length})`}
              key="pending"
            >
              <List
                dataSource={pendingMembers}
                renderItem={member => (
                  <List.Item
                    style={{ padding: '12px 0' }}
                    actions={[
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        style={{ color: '#52c41a' }}
                        onClick={() => handleAcceptMember(member.id)}
                      />,
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseCircleOutlined />}
                        danger
                        onClick={() => handleRejectMember(member.id)}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          size={36}
                          src={member.avatar} 
                          icon={<UserOutlined />}
                          style={{
                            backgroundColor: !member.avatar ? '#1677ff' : 'transparent'
                          }}
                        />
                      }
                      title={member.display_name || member.username}
                      description={
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          Yêu cầu: {formatDate(member.requested_at)}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default RoomDetails;
