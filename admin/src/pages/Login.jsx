import React, { useState } from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { colors } from "../constants/colors";

const { Title, Text } = Typography;

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      navigate("/");
    } catch (error) {
      // Error message is handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (

      <Card
        style={{
          width: "100%",
          maxWidth: "460px",
          borderRadius: "16px",
          boxShadow: `0 4px 24px ${colors.shadowPrimary}`,
          background: colors.bgTransparent,
          backdropFilter: "blur(10px)",
          padding: "28px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title
            level={2}
            style={{
              color: colors.primary,
              fontSize: "32px",
              marginBottom: "10px",
            }}
          >
            Chào Mừng Trở Lại
          </Title>
          <Text style={{ color: colors.textSecondary, fontSize: "18px" }}>
            Đăng nhập vào tài khoản quản trị
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ email: "admin@example.com" }}
          style={{ width: "100%" }}
        >
          <Form.Item
            name="email"
            validateTrigger="onSubmit" // Ensures validation only on submit
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Vui lòng nhập email hợp lệ!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: colors.primary, fontSize: "20px" }} />}
              placeholder="Email"
              autoComplete="email"
              style={{
                height: "50px",
                borderRadius: "8px",
                fontSize: "18px",
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            validateTrigger="onSubmit" // Ensures validation only on submit
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: colors.primary, fontSize: "20px" }} />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
              style={{
                height: "50px",
                borderRadius: "8px",
                fontSize: "18px",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: "12px" }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              style={{
                height: "50px",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "500",
                background: colors.primaryButtonGradient,
                border: "none",
                boxShadow: `0 2px 8px ${colors.shadowButton}`,
              }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Text style={{ color: colors.textSecondary, fontSize: "16px" }}>
              Thông tin đăng nhập mặc định: admin@example.com / 123456
            </Text>
          </div>
        </Form>
      </Card>
  );
}

export default Login;
