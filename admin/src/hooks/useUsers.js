import { useState } from 'react';
import { message } from 'antd';
import { userService } from '../services';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleEdit = async (values, editingUser) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, values);
        message.success("Cập nhật người dùng thành công");
      } else {
        await userService.createUser(values);
        message.success("Tạo người dùng thành công");
      }
      fetchUsers();
      return true;
    } catch (error) {
      message.error(error.message || "Lỗi khi lưu người dùng");
      return false;
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await userService.resetPassword(userId);
      message.success("Mật khẩu đã được đặt lại thành công. Mật khẩu mới là 123456");
    } catch (error) {
      message.error("Lỗi khi đặt lại mật khẩu");
    }
  };
  
  const handleDelete = async (userId) => {
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

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleTableChange = ({ current, pageSize }) => {
    setFilters(prev => ({
      ...prev,
      page: current,
      limit: pageSize
    }));
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

  return {
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
  };
}