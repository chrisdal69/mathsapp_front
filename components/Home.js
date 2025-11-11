import React from "react";
import { Layout, Menu, theme } from "antd";
const { Content } = Layout;
import EnTete from "./EnTete";
import Card from "./Card";

const props1 = {
  num: 1,
  titre: "Nombres complexes et dictionnaires",
};

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Content>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 20,
            padding: 15,
            borderRadius: borderRadiusLG,
            marginTop: 0,
          }}
          className="flex flex-col  gap-y-20 items-center"
        >
          <Card {...props1}  />
          <Card {...props1}  />
          <Card {...props1}  />
          <Card {...props1}  />
          <Card {...props1} />
          <Card {...props1}  />
        </div>
      </Content>
    </Layout>
  );
};
export default App;
