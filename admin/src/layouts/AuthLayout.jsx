import React from "react";
import { Layout } from "antd";
import { colors } from "../constants/colors";

function AuthLayout({ children }) {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: colors.primaryGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px" }}>{children}</div>
    </Layout>
  );
}

export default AuthLayout;
