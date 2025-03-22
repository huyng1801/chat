import React from 'react';
import { Card, Statistic } from 'antd';
import { colors } from '../../constants/colors';

function StatisticCard({ title, value, prefix, loading, color }) {
  return (
    <Card
      style={{
        borderRadius: '8px',
        boxShadow: `0 2px 8px ${colors.shadowPrimary}`,
        height: '100%'
      }}
      bodyStyle={{
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Statistic
        title={
          <span style={{ 
            fontSize: '16px',
            color: colors.textSecondary
          }}>
            {title}
          </span>
        }
        value={value || 0}
        prefix={prefix}
        loading={loading}
        valueStyle={{
          color: color || colors.primary,
          fontSize: '24px',
          fontWeight: 600
        }}
      />
    </Card>
  );
}

export default StatisticCard;