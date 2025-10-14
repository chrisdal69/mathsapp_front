import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setAuthenticated, clearAuth } from "../reducers/authSlice";

export default function Account() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const response = await res.json();
        setMessage(response.message);
        dispatch(clearAuth());
        setTimeout(() => router.push("/login"), 1000);
      } else {
        setMessage("Erreur lors de la déconnexion.");
      }
    } catch {
      setMessage("Erreur serveur.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 rounded-xl shadow-lg p-6 bg-white text-center">
      <h2 className="text-2xl font-semibold mb-6">Mon compte</h2>
      {user &&<h2 className="text-2xl  mb-6">{user.nom} {user.prenom}</h2>}
      {message && <p className="text-blue-600 mb-4">{message}</p>}

      <button
        onClick={handleLogout}
        className="w-full py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 mb-4"
      >
        Logout
      </button>

      <Link
        href="/changepassword"
        className="inline-block py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        Changer le mot de passe
      </Link>
    </div>
  );
}

///////////////////////////////////////////////////////////////
import React, { useEffect, useState } from "react";
import { Layout, Menu, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setAuthenticated, clearAuth } from "../reducers/authSlice";

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
    "/login": "3",
    "/signup": "3",
    "/forgot": "3",
    "/account": "3",
    "/changepassword": "3",
  };

  const selectedKey = pathToKey[router.pathname] || "1";

  const items = [
    { key: "1", label: <Link href="/">Maths</Link> },
    { key: "2", label: <Link href="/python">Python</Link> },
    {
      key: "3",
      icon: <UserOutlined />,
      label: isAuthenticated ? (
        <Link href="/account">{user.nom} {user.prenom}</Link>
      ) : (
        <Link href="/login">Login</Link>
      ),
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
