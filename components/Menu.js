import React from "react";
import { Layout, Menu, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Link from "next/link";
const { Header, Content, Footer } = Layout;

const items = [
  {
    key: "1",
    label: <Link href="/">Maths</Link>,
  },
  {
    key: "2",
    label: <Link href="/python">Python</Link>,
  },
  {
    key: "3",
    icon: <UserOutlined />,
    label: <Link href="/login">Login</Link>,
  },
];

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        border: "0px solid white",
      }}
    >
      <div className="demo-logo" />
      <Menu
        theme="dark"
        mode="horizontal"
        reverseArrow="true"
        defaultSelectedKeys={["1"]}
        items={items}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          border: "0px solid white",
        }}
      />
    </Header>
  );
};
export default App;
