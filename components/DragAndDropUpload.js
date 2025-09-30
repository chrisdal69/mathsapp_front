import { Form, Upload, Button, Input } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

const DragAndDropUpload = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name || "");

    // Ajout des fichiers depuis le fileList
    values.files?.forEach((fileWrapper) => {
      formData.append("fichiers", fileWrapper.originFileObj);
    });

    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Réponse du back:", data);
      data.result && form.resetFields();
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
        <Button htmlType="button" onClick={onReset} className="w-25 mx-10">
          Reset
        </Button>
      </div>
    </Form>
  );
};

export default DragAndDropUpload;
