import React, { useEffect, useState } from "react";
import { Layout, Menu, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setAuthenticated, clearAuth } from "../reducers/authSlice";
import Modal from "./Modal";

const { Header } = Layout;

export default function Nav() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isAdmin = isAuthenticated && user?.role === "admin";
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const pathToKey = {
    "/": "1",
    "/admin": "1",
    "/python": "2",
    "/admin/python": "2",
    "/signup": "3",
    "/forgot": "3",
    "/changepassword": "3",
  };

  const selectedKey = pathToKey[router.pathname] || "1";
  const mathsHref = isAdmin ? "/admin" : "/";
  const pythonHref = isAdmin ? "/admin/python" : "/python";
  const items = [
    { key: "1", label: <Link href={mathsHref}>Maths</Link> },
    { key: "2", label: <Link href={pythonHref}>Python</Link> },
    { key: "3", icon: <UserOutlined />, label: <Modal /> },
  ];
  return (
    <Header style={{ display: "flex", alignItems: "center" }}>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={items}
        style={{ flex: 1, justifyContent: "flex-end" }}
      />
    </Header>
  );
}
