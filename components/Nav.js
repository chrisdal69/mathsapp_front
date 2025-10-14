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
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const res = await fetch("http://localhost:3000/users/me", {
  //         credentials: "include",
  //       });
  //       if (res.ok) {
  //         const response = await res.json();
  //         console.log("response ds Nav.js" , response)
  //         dispatch(setAuthenticated(response || null));
  //       } else {
  //         dispatch(clearAuth());
  //       }
  //     } catch {
  //       dispatch(clearAuth());
  //     }
  //   };
  //   checkAuth();
  // }, [dispatch]);

  const pathToKey = {
    "/": "1",
    "/python": "2",
    "/signup": "3",
    "/forgot": "3",
    "/changepassword": "3",
  };

  const selectedKey = pathToKey[router.pathname] || "1";

  const items = [
    { key: "1", label: <Link href="/">Maths</Link> },
    { key: "2", label: <Link href="/python">Python</Link> },
    {
      key: "3",
      icon: <UserOutlined />,
       label:  <Modal /> ,
    },
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
