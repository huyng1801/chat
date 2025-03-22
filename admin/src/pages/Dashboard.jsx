import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, DatePicker, Spin, Card } from 'antd';
import { UserOutlined, MessageOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';
import { statisticsService } from '../services';
import { colors } from '../constants/colors';

import StatisticCard from '../components/dashboard/StatisticCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import UserDistributionChart from '../components/dashboard/UserDistributionChart';
import RoomActivityChart from '../components/dashboard/RoomActivityChart';
import ActivityTable from '../components/dashboard/ActivityTable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const { Title: AntTitle } = Typography;
const { RangePicker } = DatePicker;

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overall: null,
    messages: [],
    users: null,
    rooms: null,
    activities: []
  });
  
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(14, 'day'),
    dayjs().add(1, 'day')
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;

      const [
        overallStats,
        messageStats,
        userStats,
        roomStats,
        activities
      ] = await Promise.all([
        statisticsService.getOverallStats(),
        statisticsService.getMessageStats(
          startDate.format('YYYY-MM-DD'),
          endDate.format('YYYY-MM-DD')
        ),
        statisticsService.getUserStats(),
        statisticsService.getRoomStats(),
        statisticsService.getRecentActivities()
      ]);

      setStats({
        overall: overallStats,
        messages: messageStats,
        users: userStats,
        rooms: roomStats,
        activities
      });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats.overall) {
    return (
      <div style={{ 
        height: 'calc(100vh - 200px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: colors.bgSecondary
      }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px',
      minHeight: 'calc(100vh - 112px)',
      background: colors.bgSecondary
    }}>
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '8px',
          boxShadow: `0 2px 8px ${colors.shadowPrimary}`
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <AntTitle 
            level={2} 
            style={{ 
              margin: 0,
              color: colors.textPrimary
            }}
          >
            Tổng quan hệ thống
          </AntTitle>
          <RangePicker 
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            style={{
              borderRadius: '6px'
            }}
          />
        </div>
      </Card>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="Tổng người dùng"
            value={stats.overall?.users}
            prefix={<UserOutlined style={{ color: colors.primary }} />}
            loading={loading}
            color={colors.primary}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="Tổng tin nhắn"
            value={stats.overall?.totalMessages}
            prefix={<MessageOutlined style={{ color: colors.success }} />}
            loading={loading}
            color={colors.success}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="Phòng chat"
            value={stats.overall?.totalRooms}
            prefix={<TeamOutlined style={{ color: colors.warning }} />}
            loading={loading}
            color={colors.warning}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="Đang hoạt động"
            value={stats.overall?.activeUsers}
            prefix={<ClockCircleOutlined style={{ color: colors.info }} />}
            loading={loading}
            color={colors.info}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Card
            style={{
              borderRadius: '8px',
              boxShadow: `0 2px 8px ${colors.shadowPrimary}`
            }}
          >
            <ActivityChart 
              data={stats.messages} 
              loading={loading} 
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: '8px',
              boxShadow: `0 2px 8px ${colors.shadowPrimary}`
            }}
          >
            <UserDistributionChart 
              data={stats.users?.roleDistribution} 
              loading={loading} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <Card
            style={{
              borderRadius: '8px',
              boxShadow: `0 2px 8px ${colors.shadowPrimary}`
            }}
          >
            <RoomActivityChart 
              data={stats.rooms?.topRooms} 
              loading={loading} 
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: '8px',
          boxShadow: `0 2px 8px ${colors.shadowPrimary}`
        }}
      >
        <ActivityTable 
          data={stats.activities} 
          loading={loading} 
        />
      </Card>
    </div>
  );
}

export default Dashboard;
