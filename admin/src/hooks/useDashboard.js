import { useState, useEffect } from 'react';
import { statisticsService } from '../services';
import dayjs from 'dayjs';

export function useDashboard() {
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
    dayjs()
  ]);

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
          endDate.add(1, 'day').format('YYYY-MM-DD')
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

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  return {
    loading,
    stats,
    dateRange,
    setDateRange
  };
}