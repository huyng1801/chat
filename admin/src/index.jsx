import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
  },
  components: {
    Layout: {
      bodyBg: '#f0f2f5',
      headerBg: '#fff',
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1677ff',
    },
    Card: {
      boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)',
    },
    Table: {
      headerBg: '#fafafa',
      borderRadius: 6,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);