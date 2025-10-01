import { Form, Upload, Button, Input } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Spin } from "antd";

const { Dragger } = Upload;

const DragAndDropUpload = () => {
  const [form] = Form.useForm();
  const [upload, setUpload] = useState(false); //affichage du spin
  const [messageErreur, setMessageErreur] = useState(""); //affichage commentaire entre boutons
  const [colorMessage, setColorMessage] = useState("text-red-300");

  const onFinish = async (values) => {
    setUpload(true);
    const formData = new FormData();
    console.log(values, !values.name, !values.files);
    if (!values.name) {
      setUpload(false);
      setMessageErreur("Le champ Nom doit être complété");
      setTimeout(() => setMessageErreur(""), 1000);
      return;
    }
    if (!values.files) {
      setUpload(false);
      setMessageErreur("Aucun fichier sélectionné");
      setTimeout(() => setMessageErreur(""), 1000);
      return;
    }
    formData.append("name", values.name || "");
    // Ajout des fichiers depuis le fileList
    values.files?.forEach((fileWrapper) => {
      formData.append("fichiers", fileWrapper.originFileObj);
    });
    try {
      const res = await fetch("https://mathsapp-back.vercel.app/users", {
      //const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Réponse du back:", data);
      if (data.result) {
        form.resetFields();
        setUpload(false);
        const mes = `Fichiers uploadés :  ${data.files.join()}`;
        setColorMessage("text-green-400");
        setMessageErreur(mes);
        setTimeout(() => {
          setMessageErreur("");
          setColorMessage("text-red-300");
        }, 3000);
      }
    } catch (err) {
      console.error("Erreur upload:", err);
    }
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <Form.Item label="Nom" name="name">
        <Input placeholder="user name" variant="filled" />
      </Form.Item>

      <Form.Item
        label="Drag & Drop"
        name="files"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Dragger multiple beforeUpload={() => false} >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Cliquez ou glissez-déposez des fichiers ici
          </p>
          <p className="ant-upload-hint">Supporte l’upload multiple</p>
        </Dragger>
      </Form.Item>
      <div className="flex justify-around">
        <Button type="primary" htmlType="submit">
          Envoyer
        </Button>
        {upload && <Spin size="large" />}
        {messageErreur && <p className={colorMessage}>{messageErreur}</p>}
        <Button htmlType="button" onClick={onReset} className="w-25 ">
          Reset
        </Button>
      </div>
    </Form>
  );
};

export default DragAndDropUpload;
