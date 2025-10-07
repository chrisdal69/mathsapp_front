import React from "react";
import { useState } from "react";
import { Button, Checkbox, Form, Input } from "antd";

const onFinish = async (values) => {
  try {
    //const res = await fetch("https://mathsapp-back.vercel.app/users", {
    let res = await fetch("http://localhost:3000/users/protected", {
      method: "GET",
      credentials: "include",
    });
    if (res.status === 401) {
      const response = await fetch("http://localhost:3000/users/refresh", {
        method: "POST",
        credentials: "include",
      });
      console.log("response après status 401 : " , response );
      const data2 = await response.json();

      if (!data2.result) {
        console.log("session expirée, il faut de reloguer !");
        return;
      }
      console.log("on relance  : " )

      res = await fetch("http://localhost:3000/users/protected", {
      method: "GET",
      credentials: "include",
    });
    }
    const data = await res.json();
    console.log("Réponse du back:", data);
  } catch (err) {
    console.error("Erreur upload:", err);

    return;
  }
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

export default function App() {
  return (
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Test des requetes
        </Button>
      </Form.Item>
    </Form>
  );
}
