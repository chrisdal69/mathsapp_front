import React from "react";
import { Layout, theme } from "antd";
const { Content } = Layout;
import { LoaderCircle, Lock, Mail } from "lucide-react";

import { ChangeEvent, FormEvent, useState } from "react";


export default function LoginPage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
 
  return (
    <Layout>
      <Content style={{ padding: "0 48px" }}>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
            marginTop: "20px",
          }}
        >
          <div className="flex justify-center">

          </div>
        </div>
      </Content>
    </Layout>
  );
}
