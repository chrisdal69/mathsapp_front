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
    "/signup": "4",
    "/forgot": "4",
    "/changepassword": "4",
  };

  const keyByRepertoire = {
    ciel1: "2",
    python: "3",
  };

  const isDynamicRoute =
    router.pathname === "/[repertoire]" ||
    router.pathname === "/admin/[repertoire]";

  const rawRepertoire = Array.isArray(router.query.repertoire)
    ? router.query.repertoire[0]
    : router.query.repertoire;

  const selectedKey = !router.isReady
    ? "1"
    : isDynamicRoute
    ? keyByRepertoire[rawRepertoire] || "1"
    : pathToKey[router.pathname] || "1";
  const accueilHref = isAdmin ? "/admin" : "/";
  const mathsHref = isAdmin ? "/admin/ciel1" : "/ciel1";
  const pythonHref = isAdmin ? "/admin/python" : "/python";
  const items = [
    { key: "1", label: <Link href={accueilHref}>Accueil</Link> },
    { key: "2", label: <Link href={mathsHref}>Maths</Link> },
    { key: "3", label: <Link href={pythonHref}>Python</Link> },
    { key: "4", icon: <UserOutlined />, label: <Modal /> },
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
