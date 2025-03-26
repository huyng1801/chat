import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Form, Input, Select, Space, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { forbiddenWordService } from '../../services';

function ForbiddenWordModal({ visible, onClose, roomId }) {
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      fetchForbiddenWords();
    }
  }, [visible]);

  const fetchForbiddenWords = async () => {
    try {
      setLoading(true);
      const data = await forbiddenWordService.getForbiddenWords(roomId);
      // Ensure data is an array
      setWords(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Không thể tải danh sách từ cấm');
      setWords([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await forbiddenWordService.addForbiddenWord(roomId, values.word, values.action);
      message.success('Thêm từ cấm thành công');
      form.resetFields();
      fetchForbiddenWords();
    } catch (error) {
      message.error(error.message || 'Không thể thêm từ cấm');
    }
  };

  const handleDelete = async (id) => {
    try {
      await forbiddenWordService.removeForbiddenWord(roomId, id);
      message.success('Xóa từ cấm thành công');
      fetchForbiddenWords();
    } catch (error) {
      message.error(error.message || 'Không thể xóa từ cấm');
    }
  };

  const columns = [
    {
      title: 'Từ cấm',
      dataIndex: 'word',
      key: 'word'
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (text) => (
        <Tag color={text === 'block' ? 'error' : 'warning'}>
          {text === 'block' ? 'Chặn tin nhắn' : 'Thay thế bằng dấu *'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'operations',
      render: (_, record) => (
        <Popconfirm
          title="Xóa từ cấm"
          description="Bạn có chắc chắn muốn xóa từ cấm này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      )
    }
  ];

  return (
    <Modal
      title="Quản lý từ cấm"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="inline"
        onFinish={handleSubmit}
        style={{ marginBottom: '24px' }}
      >
        <Form.Item
          name="word"
          rules={[{ required: true, message: 'Vui lòng nhập từ cấm' }]}
          style={{ flex: 1 }}
        >
          <Input placeholder="Nhập từ cấm" />
        </Form.Item>

        <Form.Item
          name="action"
          rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
          initialValue="censor"
        >
          <Select style={{ width: 200 }}>
            <Select.Option value="censor">Thay thế bằng dấu *</Select.Option>
            <Select.Option value="block">Chặn tin nhắn</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<PlusOutlined />}
          >
            Thêm
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={words || []} // Ensure dataSource is always an array
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </Modal>
  );
}

export default ForbiddenWordModal;