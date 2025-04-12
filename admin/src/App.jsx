import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import ChatRooms from './pages/ChatRooms';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Settings from './pages/Settings';
import AutoReplies from './pages/AutoReplies';
import { colors } from './constants/colors';

const theme = {
  token: {
    colorPrimary: colors.primary,
    borderRadius: 6,
  },
  components: {
    Layout: {
      bodyBg: colors.bgSecondary,
      headerBg: colors.bgPrimary,
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      darkItemBg: colors.primary,
      darkItemSelectedBg: colors.primaryLight,
    },
    Card: {
      boxShadow: `0 1px 2px 0 ${colors.shadowPrimary}`,
    },
    Table: {
      headerBg: colors.bgSecondary,
      borderRadius: 6,
    },
  },
};

const PrivateRoute = ({ children }) => {
  const { user, loading, isOwner, isAdmin, isModerator } = useAuth();
  
  if (loading) return null;
  
  // Allow both admin and moderator roles
  if (!user || (!isOwner && !isAdmin && !isModerator)) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <AuthLayout>
              <Login />
            </AuthLayout>
          )
        } />
        
        <Route path="/*" element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="chat-rooms" element={<ChatRooms />} />
                <Route path="chat" element={<Chat />} />
                <Route path="chat/room/:roomId" element={<Chat />} />
                <Route path="chat/user/:userId" element={<Chat />} />
                <Route path="profile" element={<Profile />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="settings" element={<Settings />} />
                <Route path="auto-replies" element={<AutoReplies />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;