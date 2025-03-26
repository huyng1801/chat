import React from 'react';
import { Empty, Typography, Spin } from 'antd';
import { Pie } from 'react-chartjs-2';
import { colors } from '../../constants/colors';

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

  // Map roles to display labels
  const roleLabels = {
    owner: 'Chủ sở hữu',
    admin: 'Quản trị viên',
    moderator: 'Điều hành viên',
    user: 'Người dùng'
  };

  // Map roles to colors
  const roleColors = {
    owner: colors.error,
    admin: colors.warning,
    moderator: colors.success,
    user: colors.primary
  };

  // Sort data by role priority
  const rolePriority = ['owner', 'admin', 'moderator', 'user'];
  const sortedData = [...data].sort((a, b) => 
    rolePriority.indexOf(a.role) - rolePriority.indexOf(b.role)
  );

  const chartData = {
    labels: sortedData.map(item => roleLabels[item.role] || item.role),
    datasets: [{
      data: sortedData.map(item => item.value),
      backgroundColor: sortedData.map(item => roleColors[item.role] || colors.primary),
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
          padding: 20,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => ({
                text: `${label} (${data.datasets[0].data[i]})`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor,
                lineWidth: data.datasets[0].borderWidth,
                hidden: isNaN(data.datasets[0].data[i]),
                index: i
              }));
            }
            return [];
          }
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