import React from "react";
import { Layout, Menu, theme } from "antd";
const {  Footer } = Layout;

const App = () => {
  const {
    token: { colorTextSecondary },
  } = theme.useToken();
  return (
    <Footer style={{  borderTop:"1px solid #333",  textAlign: "center", background: "#ced5d5",color:colorTextSecondary }} className="mt-0 p-0">
      MathsApp ©{new Date().getFullYear()}
    </Footer>
  );
};
export default App;
