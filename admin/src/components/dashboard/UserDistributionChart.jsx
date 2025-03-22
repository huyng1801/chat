import React from 'react';
import { Empty, Typography, Spin } from 'antd';
import { Pie } from 'react-chartjs-2';
import { colors } from '../../constants/colors';

const { Title } = Typography;

function UserDistributionChart({ data, loading }) {
  if (loading) {
    return (
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin />
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Empty description="Không có dữ liệu phân bố" />
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => {
      const roleLabels = {
        admin: 'Quản trị viên',
        moderator: 'Điều hành viên',
        user: 'Người dùng'
      };
      return roleLabels[item.role] || item.role;
    }),
    datasets: [{
      data: data.map(item => item.value),
      backgroundColor: [
        colors.error,
        colors.warning,
        colors.success
      ],
      borderColor: colors.bgPrimary,
      borderWidth: 2
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Phân bố người dùng theo vai trò',
        font: {
          size: 16,
          weight: 600
        },
        padding: {
          bottom: 20
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}

export default UserDistributionChart;