import React from "react";
import { Layout, Menu, theme } from "antd";
const { Content } = Layout;
import MyForm from "./DragAndDropUpload";
import EnTete from "./EnTete";
import Card from "./Card";

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Content style={{ padding: "0 48px" }}>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
            marginTop: "20px",
          }}
        >
          <div className="md:px-[22%] px-[10%] mx-auto py-2 mt-5 border-b-[2px] border-blue-500  ">
            <EnTete />
          </div>

          <div className=" md:px-[22%] md:mx-auto w-full mt-5 px-[10%]   ">
            <Card num = "1" />
            <br/>
            <Card num = "2" />
            <br/>
            <Card num = "3" />
          </div>
        </div>
      </Content>
    </Layout>
  );
};
export default App;
