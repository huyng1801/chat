import React from 'react';
import { Empty, Typography, Spin } from 'antd';
import { Bar } from 'react-chartjs-2';
import { colors } from '../../constants/colors';

const { Title } = Typography;

function RoomActivityChart({ data, loading }) {
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
        <Empty description="Không có dữ liệu hoạt động phòng" />
      </div>
    );
  }

  const chartData = {
    labels: data.map(room => room.name),
    datasets: [{
      label: 'Số tin nhắn',
      data: data.map(room => room.message_count),
      backgroundColor: `${colors.success}80`,
      borderColor: colors.success,
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Top phòng chat hoạt động',
        font: {
          size: 16,
          weight: 600
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        grid: {
          color: `${colors.borderColor}40`
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          color: `${colors.borderColor}40`
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default RoomActivityChart;