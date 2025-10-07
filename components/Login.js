import React from "react";
import { useState } from "react";
import { Button, Checkbox, Form, Input } from "antd";

const onFinish = async (values) => {
  console.log("Success:", values);
  const formData = new FormData();
  formData.append("email", values.email);
  formData.append("password", values.password);
  formData.append("remember", values.remember);
  try {
    //const res = await fetch("https://mathsapp-back.vercel.app/users", {
    const res = await fetch("http://localhost:3000/users/login", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
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
      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: "Please input your email!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item name="remember" valuePropName="checked" label={null}>
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Login
        </Button>
      </Form.Item>
    </Form>
  );
}
