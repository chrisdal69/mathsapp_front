import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "antd";
import ContentBlock from "./card/ContentBlock";
import FilesBlock from "./card/FilesBlock";
import CloudBlock from "./card/CloudBlock";
import VideoBlock from "./card/VideoBlock";
import Quizz from "./card/QuizzBlock";

const CardBlock = (data) => {
  const [activeTabKey, setActiveTabKey] = useState("contenu");
  const onTabChange = (key) => {
    setActiveTabKey(key);
    if (typeof data.onTabChangeExternal === "function") {
      data.onTabChangeExternal(key);
    }
  };
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(()=>{
    !isAuthenticated && activeTabKey==="cloud" && setActiveTabKey("contenu");
  },[isAuthenticated])

  // Reset to "contenu" when parent sends a reset signal (used to reset other cards)
  useEffect(() => {
    if (data && Object.prototype.hasOwnProperty.call(data, 'resetSignal')) {
      setActiveTabKey("contenu");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.resetSignal]);

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
  const isvideo = activeTabKey === "video";
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
        bodyStyle={iscontenu ? { padding: 1 } : isvideo ? { padding: 0 } : undefined}
      >
        <CardBodyHeightTransition>
          {contentList[activeTabKey]}
        </CardBodyHeightTransition>
      </Card>
    </>
  );
};

export default CardBlock;

function CardBodyHeightTransition({ children }) {
  const containerRef = useRef(null);
  const prevHeightRef = useRef(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const newHeight = el.scrollHeight;
    const prev = prevHeightRef.current;

    // First render: set auto
    if (!prev) {
      el.style.height = `${newHeight}px`;
      // allow layout then set to auto for natural height
      requestAnimationFrame(() => {
        el.style.transition = "height 1000ms ease";
        el.style.height = `${newHeight}px`;
      });
      prevHeightRef.current = newHeight;
      return;
    }

    // Lock to previous height, then transition to new height
    el.style.transition = "none";
    el.style.height = `${prev}px`;
    // Force reflow
    void el.offsetHeight;
    requestAnimationFrame(() => {
      el.style.transition = "height 1000ms ease";
      el.style.height = `${newHeight}px`;
    });
    prevHeightRef.current = newHeight;

    const onEnd = (e) => {
      if (e.propertyName === "height") {
        // After transition, let it be auto so internal content can expand/collapse naturally
        el.style.transition = "";
        el.style.height = "auto";
      }
    };
    el.addEventListener("transitionend", onEnd, { once: true });
  });

  return (
    <div ref={containerRef} style={{ overflow: "hidden", height: "auto" }}>
      {children}
    </div>
  );
}
