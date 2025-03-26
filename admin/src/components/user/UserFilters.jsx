import React from 'react';
import { Space, Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

function UserFilters({ filters, onChange, onReset }) {
  return (
    <Space wrap>
      <Input
        placeholder="Tìm kiếm..."
        allowClear
        prefix={<SearchOutlined />}
        value={filters.search}
        onChange={e => onChange({ search: e.target.value })}
        style={{ width: 200 }}
      />
      
      <Select
        placeholder="Vai trò"
        allowClear
        style={{ width: 120 }}
        value={filters.role}
        onChange={value => onChange({ role: value })}
      >
        <Select.Option value="owner">Chủ sở hữu</Select.Option>
        <Select.Option value="admin">Quản trị viên</Select.Option>
        <Select.Option value="moderator">Điều hành viên</Select.Option>
        <Select.Option value="user">Người dùng</Select.Option>
      </Select>

      <Select
        placeholder="Trạng thái"
        allowClear
        style={{ width: 120 }}
        value={filters.status}
        onChange={value => onChange({ status: value })}
      >
        <Select.Option value="online">Đang hoạt động</Select.Option>
        <Select.Option value="offline">Không hoạt động</Select.Option>
      </Select>

      <Select
        placeholder="Tài khoản"
        allowClear
        style={{ width: 120 }}
        value={filters.isActive}
        onChange={value => onChange({ isActive: value })}
      >
        <Select.Option value={true}>Đã kích hoạt</Select.Option>
        <Select.Option value={false}>Đã vô hiệu</Select.Option>
      </Select>

      <Button 
        icon={<ReloadOutlined />} 
        onClick={onReset}
      >
        Đặt lại
      </Button>
    </Space>
  );
}

export default UserFilters;