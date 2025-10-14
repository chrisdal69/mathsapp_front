import React, { useState } from "react";
import { Button, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import Account from "./Account";
import Login from "./Login";

export default function App() {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const showModal = () => {
    setOpen(true);
  };
  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 1000);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {isAuthenticated ? `${user.nom} ${user.prenom}` : "Login"}
      </Button>
      <Modal
        title={null}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={null}
        
      >
        {isAuthenticated ? <Account close={handleOk}/> : <Login close={handleOk} isOpen={open} />}
      </Modal>
    </>
  );
}
