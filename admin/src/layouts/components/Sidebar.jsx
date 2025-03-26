import React from "react";
import { Layout, Menu, Avatar, Typography, Space, Tag } from "antd";
import { 
  DashboardOutlined, 
  UserOutlined, 
  MessageOutlined, 
  CommentOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../constants/colors";

const { Sider } = Layout;
const { Text } = Typography;

const roleColors = {
  owner: '#ff4d4f',
  admin: '#faad14',
  moderator: '#52c41a',
  user: '#1677ff'
};

const roleLabels = {
  owner: 'Chủ sở hữu',
  admin: 'Quản trị viên',
  moderator: 'Điều hành viên',
  user: 'Người dùng'
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const menuItems = [
    { key: "/", icon: <DashboardOutlined />, label: "Bảng điều khiển" },
    { key: "/users", icon: <UserOutlined />, label: "Quản lý người dùng" },
    { key: "/chat-rooms", icon: <MessageOutlined />, label: "Danh sách phòng chat" },
    { key: "/chat", icon: <CommentOutlined />, label: "Tin nhắn" },
    // Only show settings for owner
    ...(user?.role === 'owner' ? [
      { key: "/settings", icon: <SettingOutlined />, label: "Cài đặt hệ thống" }
    ] : [])
  ];

  return (
    <Sider
      width={280}
      style={{
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        background: colors.primary,
        boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
      }}
    >
      <div
        style={{
          margin: "24px 16px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "20px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center",
          gap: "16px"
        }}>
          <div style={{ position: 'relative' }}>
            <Avatar
              size={80}
              src={user?.avatar}
              icon={<UserOutlined />}
              style={{
                backgroundColor: !user?.avatar ? colors.primaryLight : 'transparent',
                border: `3px solid rgba(255, 255, 255, 0.2)`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: user?.status === 'online' ? colors.success : colors.textLight,
                border: '3px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
              }}
            />
          </div>
          
          <Space direction="vertical" size={4} style={{ textAlign: "center" }}>
            <Text 
              strong 
              style={{ 
                color: "#fff", 
                fontSize: "18px",
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {user?.display_name || user?.username}
            </Text>
            
            <Text style={{ 
              color: "rgba(255, 255, 255, 0.8)", 
              fontSize: "14px",
              fontWeight: "500"
            }}>
              @{user?.username}
            </Text>

            <Tag 
              color={roleColors[user?.role]} 
              style={{ 
                margin: '8px 0',
                padding: '4px 12px',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {roleLabels[user?.role]}
            </Tag>
          </Space>
        </div>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: 'transparent',
          borderRight: 'none',
          padding: '8px 12px'
        }}
      />
    </Sider>
  );
}

export default Sidebar;