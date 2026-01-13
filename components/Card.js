import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { useSelector } from "react-redux";
import { Card } from "antd";
import ContentBlock from "./card/ContentBlock";
import FilesBlock from "./card/FilesBlock";
import CloudBlock from "./card/CloudBlock";
import VideoBlock from "./card/VideoBlock";
import Quizz from "./card/QuizzBlock";

const CardBlock = (data) => {
  const { isExpanded, onExpand } = data;
  const [activeTabKey, setActiveTabKey] = useState("contenu");
  const cardRef = useRef(null);
  const tabsVisible = useInView(cardRef, { once: true, amount: 0.3 });

  const handleTabClick = (key, event) => {
    if (event?.stopPropagation) {
      event.stopPropagation();
    }
    if (!isExpanded && typeof onExpand === "function" && key === activeTabKey) {
      onExpand(key);
    }
  };

  const onTabChange = (key) => {
    if (!isExpanded && typeof onExpand === "function") {
      onExpand(key);
      return; // on ne change l'onglet que lorsque la carte est étendue
    }
    setActiveTabKey(key);
    if (typeof data.onTabChangeExternal === "function") {
      data.onTabChangeExternal(key);
    }
  };
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    !isAuthenticated && activeTabKey === "cloud" && setActiveTabKey("contenu");
  }, [isAuthenticated, activeTabKey]);

  // Reset to "contenu" when parent sends a reset signal (used to reset other cards)
  useEffect(() => {
    if (data && Object.prototype.hasOwnProperty.call(data, "resetSignal")) {
      setActiveTabKey("contenu");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.resetSignal]);

  useEffect(() => {
    if (data?.initialActiveTabKey) {
      setActiveTabKey(data.initialActiveTabKey);
    }
  }, [data?.initialActiveTabKey]);

  const tabList = [
    { key: "contenu", label: "Contenu" },
    data.fichiers &&
      data.fichiers.length !== 0 && { key: "fichiers", label: "Fichiers" },
    (data.evalQuizz === "non" ||
      (isAuthenticated && data.evalQuizz === "oui")) &&
      data.quizz &&
      data.quizz.length !== 0 && { key: "quizz", label: "Quiz" },
    isAuthenticated && data.cloud && { key: "cloud", label: "Cloud" },
    data.video && data.video.length !== 0 && { key: "video", label: "Vidéos" },
  ].filter(Boolean); // <-- indispensable pour retirer les false/undefined

  const contentList = {
    contenu: <ContentBlock {...data} />,
  };

  if (data.fichiers && data.fichiers.length != 0) {
    contentList.fichiers = <FilesBlock {...data} />;
  }

  if (data.video && data.video.length != 0) {
    contentList.video = <VideoBlock {...data} />;
  }
  if (isAuthenticated) {
    contentList.cloud = <CloudBlock {...data} />;
  }
  if (
    (data.evalQuizz === "non" ||
      (isAuthenticated && data.evalQuizz === "oui")) &&
    data.quizz &&
    data.quizz.length != 0
  ) {
    contentList.quizz = <Quizz {...data} />;
  }
  const iscontenu = activeTabKey === "contenu";
  const isvideo = activeTabKey === "video";
  const isfichiers = activeTabKey === "fichiers";

  return (
    <div
      ref={cardRef}
      className={`card-tabs-reveal ${
        tabsVisible ? "card-tabs-reveal--visible" : ""
      }`}
    >
      <Card
        title={data.titre}
        style={{ width: "100%",  }}
        tabList={tabList}
        activeTabKey={activeTabKey}
        onTabChange={onTabChange}
        className="shadow-md hover:shadow-3xl transition-shadow duration-200 rounded-3xl"
        tabProps={{ size: "middle", onTabClick: handleTabClick }}
        styles={
          iscontenu
            ? { body: { padding: 1 } }
            : isvideo || isfichiers
            ? { body: { padding: 0 } }
            : undefined
        }
      >
        <div className={activeTabKey === "contenu" ? "" : "hidden"}>
          {contentList.contenu}
        </div>
        {activeTabKey === "fichiers" && contentList.fichiers}
        {activeTabKey === "quizz" && contentList.quizz}
        {activeTabKey === "cloud" && contentList.cloud}
        {activeTabKey === "video" && contentList.video}
      </Card>
    </div>
  );
};

export default CardBlock;
