import React from "react";
import { Layout, Menu, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router"; // 👈 import indispensable

const { Header } = Layout;

const App = () => {
  const router = useRouter(); // 👈 pour connaître la route actuelle
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // ✅ on mappe la route actuelle à la clé du menu
  const pathToKey = {
    "/": "1",
    "/python": "2",
    "/login": "3",
    "/signup": "3",
    "/forgot": "3",
  };

  const selectedKey = pathToKey[router.pathname] || "1"; // clé active selon la route

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
        selectedKeys={[selectedKey]} // ✅ dynamique, remplace defaultSelectedKeys
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
