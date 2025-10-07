import React from "react";
import { Layout, Menu, theme } from "antd";
const {  Footer } = Layout;

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Footer style={{ textAlign: "center" }}>
      MathsApp ©{new Date().getFullYear()}
    </Footer>
  );
};
export default App;
