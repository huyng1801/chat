import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { authService } from '../services';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const userData = await authService.getCurrentUser(token);
      
      if (!userData) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Allow both admin and moderator roles
      if (!['admin', 'moderator'].includes(userData.role)) {
        throw new Error('Truy cập bị từ chối. Yêu cầu quyền quản trị hoặc điều hành.');
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      message.error(error.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { user: userData, token: authToken } = await authService.login(email, password);
      
      if (!userData || !authToken) {
        throw new Error('Phản hồi không hợp lệ từ máy chủ');
      }
  
      // Allow both admin and moderator roles
      if (!['admin', 'moderator'].includes(userData.role)) {
        throw new Error('Truy cập bị từ chối. Yêu cầu quyền quản trị hoặc điều hành.');
      }

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      
      message.success('Đăng nhập thành công');
      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Đăng nhập thất bại';
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setLoading(false);
      message.success('Đăng xuất thành công');
    }
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData, token);
      setUser(updatedUser);
      message.success('Cập nhật thông tin thành công');
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      message.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator',
    token,
    updateUser,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};