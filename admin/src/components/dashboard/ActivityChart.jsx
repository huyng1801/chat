import React from 'react';
import { Empty, Typography, Spin } from 'antd';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { colors } from '../../constants/colors';

const { Title } = Typography;

function ActivityChart({ data, loading }) {
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
        <Empty description="Không có dữ liệu hoạt động" />
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => format(new Date(item.date), 'dd/MM', { locale: vi })),
    datasets: [{
      label: 'Số tin nhắn',
      data: data.map(item => item.count),
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}20`,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
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
        text: 'Thống kê tin nhắn theo ngày',
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
      <Line data={chartData} options={options} />
    </div>
  );
}

export default ActivityChart;
