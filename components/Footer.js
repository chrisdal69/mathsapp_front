import React from "react";
import { Layout, Menu, theme } from "antd";
const {  Footer } = Layout;

const App = () => {
  const {
    token: { colorTextSecondary },
  } = theme.useToken();
  return (
    <Footer style={{  textAlign: "center", background: "#001529",color:colorTextSecondary }} className="mt-20 p-0">
      MathsApp ©{new Date().getFullYear()}
    </Footer>
  );
};
export default App;
