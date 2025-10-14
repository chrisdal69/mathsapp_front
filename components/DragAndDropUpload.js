import { Form, Upload, Button, Input } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "../reducers/authSlice";

const NODE_ENV = process.env.NODE_ENV;
const URL_BACK = process.env.NEXT_PUBLIC_URL_BACK;
const urlFetch = NODE_ENV === "production" ? URL_BACK : "http://localhost:3000";

const { Dragger } = Upload;

const DragAndDropUpload = () => {
  const [form] = Form.useForm();
  const [upload, setUpload] = useState(false); //affichage du spin
  const [messageErreur, setMessageErreur] = useState(""); //affichage commentaire entre boutons
  const [colorMessage, setColorMessage] = useState("text-red-300");
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    setUpload(true);
    const formData = new FormData();
    if (!values.files) {
      setUpload(false);
      setMessageErreur("Aucun fichier sélectionné");
      setTimeout(() => setMessageErreur(""), 1000);
      return;
    }
    formData.append("name", `${user.nom}${user.prenom}` || "");
    // Ajout des fichiers depuis le fileList
    values.files?.forEach((fileWrapper) => {
      formData.append("fichiers", fileWrapper.originFileObj);
    });
    try {
      const res = await fetch(`${urlFetch}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      console.log("Réponse du back:", data);
      if (res.status === 401 || res.status === 403) {
        setMessageErreur(data.message || "erreurs 401 ou 403");
        setUpload(false);
        setTimeout(() => {
          setMessageErreur("");
          form.resetFields();

          dispatch(clearAuth());
        }, 3000);
      }
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
      setUpload(false);
      setMessageErreur(`Erreur upload : ${err}`);
      setTimeout(() => setMessageErreur(""), 5000);
      form.resetFields();
      return;
    }
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <>
      {!isAuthenticated && (
        <h1 className="text-3xl">
          Il faut d'abord se loguer pour pouvoir uploader
        </h1>
      )}
      {isAuthenticated && (
        <Form form={form} onFinish={onFinish}>
          <Form.Item
            label="Drag & Drop"
            name="files"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Dragger multiple beforeUpload={() => false}>
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
      )}
    </>
  );
};

export default DragAndDropUpload;
