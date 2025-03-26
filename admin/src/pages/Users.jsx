import React, { useState, useEffect } from "react";
import { Button, Empty, Typography, Card } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUsers } from '../hooks/useUsers';
import UserTable from '../components/user/UserTable';
import UserModal from '../components/user/UserModal';
import UserFilters from '../components/user/UserFilters';

const { Text } = Typography;

function Users() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const {
    users,
    loading,
    filters,
    pagination,
    fetchUsers,
    handleEdit,
    handleResetPassword,
    handleDelete,
    handleToggleActive,
    handleFiltersChange,
    handleTableChange,
    handleReset
  } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  const handleChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "24px" 
      }}>
        <Text strong style={{ fontSize: '20px' }}>Quản lý người dùng</Text>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => {
            setEditingUser(null);
            setIsModalVisible(true);
          }}
        >
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <UserFilters 
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleReset}
          />
        </div>

        {!loading && users.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "16px", marginBottom: "16px" }}>Chưa có người dùng nào</p>
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalVisible(true)}>
                  Thêm người dùng đầu tiên
                </Button>
              </div>
            }
          />
        ) : (
          <UserTable 
            users={users}
            loading={loading}
            currentUser={currentUser}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
            onChat={handleChat}
            onToggleActive={handleToggleActive}
            pagination={pagination}
            onChange={handleTableChange}
          />
        )}
      </Card>

      <UserModal
        visible={isModalVisible}
        editingUser={editingUser}
        onCancel={handleModalCancel}
        onSubmit={handleEdit}
      />
    </div>
  );
}

export default Users;