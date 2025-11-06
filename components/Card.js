import React, { useState } from "react";
import Image from "next/image";
import { Card } from "antd";
import Cloud from "./DragAndDropUpload";
import complexe from "../public/complexe.png";
import Questionnaire from "./Questionnaire";

const tabListNoTitle = [
  { key: "contenu", label: "Contenu" },
  { key: "fichiers", label: "Fichiers" },
  { key: "quizz", label: "Quizz" },
  { key: "cloud", label: "Cloud" },
];

const CardBlock = ({ titre }) => {
  const [activeTabKey, setActiveTabKey] = useState("contenu");
  const onTabChange = (key) => setActiveTabKey(key);

  const contentListNoTitle = {
    contenu: (
      <div className="group relative w-full h-[150px] overflow-hidden">
        <p className="m-auto w-max">Bonjour</p>
        <Image
          src={complexe}
          alt="Logo"
          fill
          placeholder="blur"
          sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover object-center opacity-100 transition-all duration-300 ease-out will-change-transform group-hover:opacity-0 group-hover:scale-105 group-hover:rotate-[0.5deg] group-hover:pointer-events-none"
        />
      </div>
    ),
    fichiers: <p>Lien des fichiers</p>,
    quizz: <Questionnaire />,
    cloud: <Cloud />,
  };

  const iscontenu = activeTabKey === "contenu";
  return (
    <>
      <Card
        title={titre}
        style={{ width: "100%" }}
        tabList={tabListNoTitle}
        activeTabKey={activeTabKey}
        onTabChange={onTabChange}
        className={` shadow-md hover:shadow-xl transition-shadow duration-200`}
        tabProps={{ size: "middle" }}
        bodyStyle={iscontenu ? { padding: 1 } : undefined}
      >
        {contentListNoTitle[activeTabKey]}
      </Card>
    </>
  );
};

export default CardBlock;
