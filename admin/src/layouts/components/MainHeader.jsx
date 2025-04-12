import React from "react";
import {
  Layout,
  Dropdown,
  Menu,
  Avatar,
  Typography,
  Space,
  Breadcrumb,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { colors } from "../../constants/colors";

const { Header } = Layout;
const { Text } = Typography;

function MainHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
      navigate("/login");
    } else {
      navigate(key);
    }
  };

  const getBreadcrumbItems = () => {
    const items = [{ key: "/", title: <Link to="/">Trang chủ</Link> }];
    const paths = location.pathname.split("/").filter((path) => path);

    paths.forEach((path, index, arr) => {
      const url = `/${arr.slice(0, index + 1).join("/")}`;
      let label = "";

      switch (path) {
        case "users":
          label = "Quản lý người dùng";
          break;
        case "chat-rooms":
          label = "Danh sách phòng chat";
          break;
        case "chat":
          label = "Tin nhắn";
          break;
        case "room":
          label = "Phòng chat";
          break;
        case "user":
          label = "Chat riêng tư";
          break;
        case "profile":
          label = "Hồ sơ cá nhân";
          break;
        case "change-password":
          label = "Đổi mật khẩu";
          break;
        case "dashboard":
          label = "Bảng điều khiển";
          break;
        case "auto-replies":
          label = "Phản hồi tự động";
          break;
        case "settings":
          label = "Cài đặt hệ thống";
          break;
        default:
          label = path;
      }

      if (label) {
        items.push({
          key: url,
          title: <Link to={url}>{label}</Link>,
        });
      }
    });

    return items;
  };

  const menu = (
    <Menu
      onClick={handleMenuClick}
      style={{ minWidth: "200px", padding: "4px" }}
    >
      <Menu.Item
        key="/profile"
        icon={
          <UserOutlined style={{ fontSize: "16px", color: colors.primary }} />
        }
        style={{ padding: "10px 16px" }}
      >
        <Space align="center">
          <Text>Hồ sơ cá nhân</Text>
        </Space>
      </Menu.Item>

      <Menu.Item
        key="/change-password"
        icon={
          <LockOutlined style={{ fontSize: "16px", color: colors.primary }} />
        }
        style={{ padding: "10px 16px" }}
      >
        <Space align="center">
          <Text>Đổi mật khẩu</Text>
        </Space>
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item
        key="logout"
        icon={<LogoutOutlined style={{ fontSize: "16px" }} />}
        danger
        style={{ padding: "10px 16px" }}
      >
        <Text>Đăng xuất</Text>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        background: colors.bgPrimary,
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: `0 2px 8px ${colors.shadowPrimary}`,
      }}
    >
      <Breadcrumb items={getBreadcrumbItems()} />
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <Space
          style={{
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "6px",
            transition: "all 0.3s ease",
            ":hover": {
              background: "rgba(0, 0, 0, 0.025)",
            },
          }}
          align="center"
        >
          <Avatar
            size={40}
            src={user?.avatar}
            icon={<UserOutlined />}
            style={{
              backgroundColor: !user?.avatar ? colors.primary : "transparent",
              cursor: "pointer",
            }}
          />
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: "14px" }}>
              {user?.display_name || user?.username}
            </Text>
          </Space>
          <CaretDownOutlined
            style={{ fontSize: "12px", color: colors.textSecondary }}
          />
        </Space>
      </Dropdown>
    </Header>
  );
}

const roleLabels = {
  admin: "Quản trị viên",
  moderator: "Điều hành viên",
  user: "Người dùng",
};

export default MainHeader;
