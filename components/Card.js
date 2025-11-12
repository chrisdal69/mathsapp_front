import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "antd";
import ContentBlock from "./card/ContentBlock";
import FilesBlock from "./card/FilesBlock";
import CloudBlock from "./card/CloudBlock";
import VideoBlock from "./card/VideoBlock";
import Quizz from "./card/QuizzBlock";

const CardBlock = (data) => {
  const [activeTabKey, setActiveTabKey] = useState("contenu");
  const onTabChange = (key) => setActiveTabKey(key);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(()=>{
    !isAuthenticated && activeTabKey==="cloud" && setActiveTabKey("contenu");
  },[isAuthenticated])

  const tabList = [
    { key: "contenu", label: "Contenu" },
    { key: "fichiers", label: "Fichiers" },
    { key: "quizz", label: "Quizz" },
    isAuthenticated && data.cloud && { key: "cloud", label: "Cloud" },
    data.video && { key: "video", label: "Vidéos" },
  ];
  const contentList = {
    contenu: <ContentBlock {...data} />,
    fichiers: <FilesBlock {...data} />,
    quizz: <Quizz {...data} />,
  };

  if (data.video) {
    contentList.video = <VideoBlock {...data} />;
  }

  if (isAuthenticated) {
    contentList.cloud = <CloudBlock />;
  }
  const iscontenu = activeTabKey === "contenu";
  return (
    <>
      <Card
        title={data.titre}
        style={{ width: "100%" }}
        tabList={tabList}
        activeTabKey={activeTabKey}
        onTabChange={onTabChange}
        className={` shadow-md hover:shadow-xl transition-shadow duration-200`}
        tabProps={{ size: "middle" }}
        bodyStyle={iscontenu ? { padding: 1 } : undefined}
      >
        {contentList[activeTabKey]}
      </Card>
    </>
  );
};

export default CardBlock;
