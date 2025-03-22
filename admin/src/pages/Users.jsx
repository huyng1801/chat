import React, { useState, useEffect } from "react";
import { Button, message, Empty, Typography, Card, Modal, Form, Space, Input, Select } from "antd";
import { UserAddOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { userService } from '../services';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserTable from '../components/user/UserTable';
import UserForm from '../components/user/UserForm';
import debounce from 'lodash/debounce';

const { Text } = Typography;

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { user: currentUser } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Filter and pagination states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    status: '',
    isActive: null,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchUsers = async (params = filters) => {
    setLoading(true);
    try {
      const data = await userService.getUsers(params);
      setUsers(data.users);
      setPagination({
        current: data.pagination.page,
        pageSize: data.pagination.limit,
        total: data.pagination.total
      });
    } catch (error) {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = debounce((value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  }, 500);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        await userService.updateUser(editingUser.id, values);
        message.success("Cập nhật người dùng thành công");
      } else {
        await userService.createUser(values);
        message.success("Tạo người dùng thành công");
      }
      
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error(error.message || "Lỗi khi lưu người dùng");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      password: undefined
    });
    setIsModalVisible(true);
  };

  const handleResetPassword = async (userId) => {
    try {
      await userService.resetPassword(userId);
      message.success("Mật khẩu đã được đặt lại thành công. Mật khẩu mới là 123456");
    } catch (error) {
      message.error("Lỗi khi đặt lại mật khẩu");
    }
  };
  
  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      message.success("Xóa người dùng thành công");
      fetchUsers();
    } catch (error) {
      message.error("Không thể xóa người dùng");
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await userService.updateUser(userId, { isActive });
      message.success(`Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`);
      fetchUsers();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái tài khoản");
    }
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      role: '',
      status: '',
      isActive: null,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
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
            form.resetFields();
            setEditingUser(null);
            setIsModalVisible(true);
          }}
        >
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="Tìm kiếm..."
              allowClear
              prefix={<SearchOutlined />}
              onChange={e => debouncedSearch(e.target.value)}
              style={{ width: 200 }}
            />
            
            <Select
              placeholder="Vai trò"
              allowClear
              style={{ width: 120 }}
              onChange={value => setFilters(prev => ({ ...prev, role: value || '', page: 1 }))}
              value={filters.role || undefined}
            >
              <Select.Option value="admin">Quản trị viên</Select.Option>
              <Select.Option value="moderator">Điều hành viên</Select.Option>
              <Select.Option value="user">Người dùng</Select.Option>
            </Select>

            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: 120 }}
              onChange={value => setFilters(prev => ({ ...prev, status: value || '', page: 1 }))}
              value={filters.status || undefined}
            >
              <Select.Option value="online">Đang hoạt động</Select.Option>
              <Select.Option value="offline">Không hoạt động</Select.Option>
            </Select>

            <Select
              placeholder="Tài khoản"
              allowClear
              style={{ width: 120 }}
              onChange={value => setFilters(prev => ({ ...prev, isActive: value, page: 1 }))}
              value={filters.isActive}
            >
              <Select.Option value={true}>Đã kích hoạt</Select.Option>
              <Select.Option value={false}>Đã vô hiệu</Select.Option>
            </Select>

            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleReset}
            >
              Đặt lại
            </Button>
          </Space>
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
            onEdit={handleEdit}
            onDelete={handleDeleteUser}
            onResetPassword={handleResetPassword}
            onToggleActive={handleToggleActive}
            pagination={pagination}
            onChange={({ current, pageSize }) => {
              setFilters(prev => ({
                ...prev,
                page: current,
                limit: pageSize
              }));
            }}
          />
        )}
      </Card>

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <UserForm 
          form={form}
          editingUser={editingUser}
        />
      </Modal>
    </div>
  );
}

export default Users;