import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "antd";
import ContentBlock from "./card/ContentBlock";
import FilesBlock from "./card/FilesBlock";
//import CloudBlock from "./card/CloudBlock";
import VideoBlock from "./card/VideoBlock";
import Quizz from "./card/QuizzBlock";

const CardBlock = (data) => {
  const [activeTabKey, setActiveTabKey] = useState("contenu");
  const [localTitle, setLocalTitle] = useState(data.titre);


  const onTabChange = (key) => {
    setActiveTabKey(key);
    if (typeof data.onTabChangeExternal === "function") {
      data.onTabChangeExternal(key);
    }
  };
  const { isAuthenticated } = useSelector((state) => state.auth);

  // useEffect(() => {
  //   !isAuthenticated && activeTabKey === "cloud" && setActiveTabKey("contenu");
  // }, [isAuthenticated, activeTabKey]);

  // Reset to "contenu" when parent sends a reset signal (used to reset other cards)
  useEffect(() => {
    if (data && Object.prototype.hasOwnProperty.call(data, "resetSignal")) {
      setActiveTabKey("contenu");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.resetSignal]);

  const tabList = [
    { key: "contenu", label: "Contenu" },
    { key: "fichiers", label: "Fichiers" },
    { key: "quizz", label: "Quizz" },
    //isAuthenticated && data.cloud && { key: "cloud", label: "Cloud" },
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

  // if (isAuthenticated) {
  //   contentList.cloud = <CloudBlock {...data}/>;
  // }

  const iscontenu = activeTabKey === "contenu";
  const isvideo = activeTabKey === "video";

  return (
    <Card
      title={localTitle}
      extra={
        <div className="flex items-center gap-2 border-1 w-100">
          <label
            htmlFor={`card-title-${data._id}`}
            className="text-xs text-gray-500"
          >
            Modifier
          </label>
          <textarea
            id={`card-title-${data._id}`}
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
          />
        </div>
      }
      style={{ width: "100%" }}
      tabList={tabList}
      activeTabKey={activeTabKey}
      onTabChange={onTabChange}
      className="shadow-md hover:shadow-xl transition-shadow duration-200"
      tabProps={{ size: "middle" }}
      styles={
        iscontenu
          ? { body: { padding: 1 } }
          : isvideo
          ? { body: { padding: 0 } }
          : undefined
      }
    >
      {contentList[activeTabKey]}
    </Card>
  );
};

export default CardBlock;
