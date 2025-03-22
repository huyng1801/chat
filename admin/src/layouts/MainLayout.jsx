import React from "react";
import { Layout, Spin } from "antd";
import { useAuth } from "../context/AuthContext";
import { useLocation, Link, useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MainHeader from "./components/MainHeader";

const { Content } = Layout;

function MainLayout({ children }) {
  const { loading } = useAuth();
  const location = useLocation();
  const { roomId, userId } = useParams();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }



  return (
    <Layout style={{ minHeight: "50vh" }}>
      <Sidebar />
      <Layout style={{ marginLeft: 280 }}>
        <MainHeader />
        <Content
          style={{
            padding: "24px",
            minHeight: "50vh",
            overflowY: "auto",
            background: "transparent",
          }}
        >

          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;