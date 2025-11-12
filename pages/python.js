import React from "react";
import { Layout, theme } from "antd";
import Card from "../components/Card";

const { Content } = Layout;

export default function PythonPage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Content>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 20,
            padding: 15,
            borderRadius: borderRadiusLG,
            marginTop: 0,
          }}
          className="flex flex-col  gap-y-20 items-center"
        >
          <Card />
        </div>
      </Content>
    </Layout>
  );
}
