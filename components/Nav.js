import React, { useEffect, useState } from "react";
import { Layout, Menu, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setAuthenticated, clearAuth } from "../reducers/authSlice";
import Modal from "./Modal";

const { Header } = Layout;

export default function Nav(props) {
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
    { key: "1", label: <Link href={accueilHref}>Accueil</Link>, className: "nav-item" },
    { key: "2", label: <Link href={mathsHref}>Maths</Link>, className: "nav-item" },
    { key: "3", label: <Link href={pythonHref}>Python</Link>, className: "nav-item" },
    { key: "4", icon: <UserOutlined />, label: <Modal />, className: "nav-item nav-item--last" },
  ];

  const navColors = {
    bg:props.bg,
    border: "#222",
    tabBorder: "#000",
    text: "#333",
    textSize: "18px",
    //selectedBg: "#c2cbcf",
    selectedBg:props.selectedBg,
    selectedText: "#0f172a",
    hoverBg: "#fff",
  };

  return (
    <>
      <Header
        className="nav-header"
        style={{ display: "flex", alignItems: "center" }}
      >
        <Menu
          className="nav-menu"
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={items}
          style={{ flex: 1, justifyContent: "flex-end" }}
        />
      </Header>
      <style jsx global>{`
        .nav-header {
          background: ${navColors.bg};
          border-bottom: 0px solid ${navColors.border};
        }
        .nav-menu.ant-menu {
          background: transparent;
          --nav-border-duration: 650ms;
          --nav-text-duration: 900ms;
          --nav-text-delay: calc(var(--nav-border-duration) + 140ms);
        }
        .nav-menu.ant-menu-dark .ant-menu-item,
        .nav-menu.ant-menu-dark .ant-menu-item a,
        .nav-menu.ant-menu-dark .ant-menu-item .anticon {
          color: ${navColors.text};
          font-size: ${navColors.textSize};
        }
        .nav-menu.ant-menu-dark .nav-item {
          position: relative;
          overflow: hidden;
        }
        .nav-menu.ant-menu-dark .nav-item::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 1px;
          height: 100%;
          background: #111;
          transform: scaleY(0);
          transform-origin: top;
          animation: navBorderDown var(--nav-border-duration)
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .nav-menu.ant-menu-dark .nav-item--last::before {
          display: none;
        }
        .nav-menu.ant-menu-dark .ant-menu-item {
          --nav-item-delay: 0ms;
        }
        .nav-menu.ant-menu-dark .ant-menu-item:nth-child(2) {
          --nav-item-delay: 80ms;
        }
        .nav-menu.ant-menu-dark .ant-menu-item:nth-child(3) {
          --nav-item-delay: 160ms;
        }
        .nav-menu.ant-menu-dark .ant-menu-item:nth-child(4) {
          --nav-item-delay: 240ms;
        }
        .nav-menu.ant-menu-dark .ant-menu-item .ant-menu-title-content,
        .nav-menu.ant-menu-dark .ant-menu-item .anticon {
          display: inline-block;
          opacity: 0;
          transform: translateY(100%);
          animation: navTextUp var(--nav-text-duration)
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: calc(var(--nav-text-delay) + var(--nav-item-delay));
          will-change: transform, opacity;
        }

        .nav-menu.ant-menu-dark .ant-menu-item-selected {
          background: ${navColors.selectedBg};
        }
        .nav-menu.ant-menu-dark .ant-menu-item-selected a,
        .nav-menu.ant-menu-dark .ant-menu-item-selected .anticon {
          color: ${navColors.selectedText};
        }
        .nav-menu.ant-menu-dark .ant-menu-item::after,
        .nav-menu.ant-menu-dark .ant-menu-item-active::after,
        .nav-menu.ant-menu-dark .ant-menu-item-selected::after {
          border-color: ${navColors.tabBorder};
        }
        .nav-menu.ant-menu-dark .ant-menu-item:hover {
          background: ${navColors.hoverBg};
        }
        @keyframes navBorderDown {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes navTextUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nav-menu.ant-menu-dark .nav-item::before {
            animation: none;
            transform: scaleY(1);
          }
          .nav-menu.ant-menu-dark .ant-menu-item .ant-menu-title-content,
          .nav-menu.ant-menu-dark .ant-menu-item .anticon {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </>
  );
}
