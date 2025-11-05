import React, { useState } from "react";
import Image from "next/image";
import { Card } from "antd";
import Cloud from "./DragAndDropUpload";
import complexe from "../public/complexe.png";

const tabListNoTitle = [
  { key: "avatar", label: "Avatar" },
  { key: "contenu", label: "Contenu" },
  { key: "fichiers", label: "Fichiers" },
  { key: "corriges", label: "Corrigés" },
  { key: "cloud", label: "Cloud" },
];

const App = ({ titre }) => {
  const [activeTabKey, setActiveTabKey] = useState("avatar");
  const onTabChange = (key) => setActiveTabKey(key);

  const contentListNoTitle = {
    avatar: (
      <div className="group relative w-full h-[150px] overflow-hidden">
        <Image
          src={complexe}
          alt="Logo"
          fill
          placeholder="blur"
          sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-300 ease-out will-change-transform group-hover:scale-105 group-hover:rotate-[0.5deg]"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    ),
    contenu: <p>Présentation du tag </p>,
    fichiers: <p>Lien des fichiers</p>,
    corriges: <p>Lien des corrigés</p>,
    cloud: <Cloud />,
  };

  const isAvatar = activeTabKey === "avatar";
  return (
    <>
      <Card
        title={titre}
        style={{ width: "80%" }}
        tabList={tabListNoTitle}
        activeTabKey={activeTabKey}
        onTabChange={onTabChange}
        className={` shadow-md hover:shadow-xl transition-shadow duration-200`}

        
        tabProps={{ size: "middle" }}
        bodyStyle={isAvatar ? { padding: 1 } : undefined}
      >
        {contentListNoTitle[activeTabKey]}
      </Card>
    </>
  );
};

export default App;