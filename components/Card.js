import React, { useState } from "react";
import { Card } from "antd";
import Cloud from "./DragAndDropUpload";

const tabListNoTitle = [
  {
    key: "contenu",
    label: "Contenu",
  },
  {
    key: "fichiers",
    label: "Fichiers",
  },
  {
    key: "corriges",
    label: "Corrigés",
  },
  {
    key: "cloud",
    label: "Cloud",
  },
];

const App = (props) => {
  console.log(props.num);
  const [activeTabKey, setActiveTabKey] = useState("contenu");
  const onTabChange = (key) => {
    setActiveTabKey(key);
  };
  const contentListNoTitle = {
    contenu: <p>Présentation du tag </p>,
    fichiers: <p>Lien des fichiers</p>,
    corriges: <p>Lien des corrigés</p>,
    cloud: <Cloud />,
  };
  const titre = `Card ${props.num}`;
  return (
    <>
      <Card
        title={titre}
        style={{ width: "100%" }}
        tabList={tabListNoTitle}
        activeTabKey={activeTabKey}
        tabBarExtraContent={<img src="img1.jpg" className="w-15"/>}
        onTabChange={onTabChange}
        tabProps={{
          size: "middle",
        }}
      >
        {contentListNoTitle[activeTabKey]}
      </Card>
    </>
  );
};
export default App;
