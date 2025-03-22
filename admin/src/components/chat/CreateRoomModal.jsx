import React from 'react';
import { Modal, Input } from 'antd';

function CreateRoomModal({ 
  isModalVisible, 
  setIsModalVisible, 
  newRoomName, 
  setNewRoomName, 
  createRoom 
}) {
  return (
    <Modal
      title="Tạo phòng chat mới"
      open={isModalVisible}
      onOk={createRoom}
      onCancel={() => setIsModalVisible(false)}
      okText="Tạo"
      cancelText="Hủy"
    >
      <Input
        placeholder="Tên phòng chat"
        value={newRoomName}
        onChange={(e) => setNewRoomName(e.target.value)}
      />
    </Modal>
  );
}

export default CreateRoomModal;