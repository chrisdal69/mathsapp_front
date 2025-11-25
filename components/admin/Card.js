import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Input, Popover, Space, message } from "antd";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import ContentBlock from "./card/ContentBlock";
import FilesBlock from "./card/FilesBlock";
import CloudBlock from "./card/CloudBlock";
import VideoBlock from "./card/VideoBlock";
import Quizz from "./card/QuizzBlock";
import QuizzResult from "./card/QuizzResult";

import { setCardsMaths } from "../../reducers/cardsMathsSlice";
import { VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";

const NODE_ENV = process.env.NODE_ENV;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";

const CardBlock = (data) => {
  const [activeTabKey, setActiveTabKey] = useState("contenu");
  const [localTitle, setLocalTitle] = useState(data.titre);
  const [titlePopoverOpen, setTitlePopoverOpen] = useState(false);
  const [pendingTitle, setPendingTitle] = useState(data.titre || "");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    data.expanded === undefined ? true : !data.expanded
  );

  const dispatch = useDispatch();
  const cardsData = useSelector((state) => state.cardsMaths.data);
  const { isAuthenticated } = useSelector((state) => state.auth);

  //console.log("cardsData du redux dans admin/Card.js : ",cardsData )

  useEffect(() => {
    setLocalTitle(data.titre);
    setPendingTitle(data.titre || "");
  }, [data.titre]);

  // sync collapse with parent-controlled expanded flag
  useEffect(() => {
    if (typeof data.expanded === "boolean") {
      setIsCollapsed(!data.expanded);
    }
  }, [data.expanded]);

  const updateCardsStore = (newTitle, updatedCard) => {
    if (!cardsData || !Array.isArray(cardsData.result)) {
      return;
    }
    const targetId =
      updatedCard?._id || updatedCard?.id || data?._id || data?.id;
    const targetNum =
      typeof updatedCard?.num !== "undefined" ? updatedCard.num : data?.num;
    const targetRepertoire = updatedCard?.repertoire || data?.repertoire || null;

    const nextResult = cardsData.result.map((card) => {
      const matchById =
        targetId && (card._id === targetId || card.id === targetId);
      const matchByComposite =
        !matchById &&
        targetId &&
        typeof targetNum !== "undefined" &&
        typeof card.num !== "undefined" &&
        card.num === targetNum &&
        targetRepertoire &&
        card.repertoire === targetRepertoire;
      if (matchById || matchByComposite) {
        return { ...card, titre: newTitle };
      }
      return card;
    });

    dispatch(setCardsMaths({ ...cardsData, result: nextResult }));
  };

  const handleSaveTitle = async () => {
    const trimmedTitle = (pendingTitle || "").trim();
    if (!trimmedTitle) {
      message.error("Le titre ne peut pas être vide.");
      return;
    }

    const cardId = data?._id || data?.id;
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }

    if ((localTitle || "").trim() === trimmedTitle) {
      setTitlePopoverOpen(false);
      return;
    }

    setIsSavingTitle(true);
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/title`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ titre: trimmedTitle }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {}

      if (!response.ok) {
        throw new Error(
          payload?.error || "Impossible de mettre à jour le titre."
        );
      }

      const updatedCard = payload?.result;
      const nextTitle = updatedCard?.titre || trimmedTitle;
      setLocalTitle(nextTitle);
      setPendingTitle(nextTitle);
      setTitlePopoverOpen(false);
      updateCardsStore(nextTitle, updatedCard);
      message.success("Titre mis à jour.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du titre :", error);
      message.error(error.message || "Erreur lors de la mise à jour du titre.");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const onTabChange = (key) => {
    setActiveTabKey(key);
    if (typeof data.onTabChangeExternal === "function") {
      data.onTabChangeExternal(key);
    }
  };

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

  const tabList = [
    { key: "contenu", label: "Contenu" },
    { key: "fichiers", label: "Fichiers" },
    { key: "quizz", label: "Quizz" },
    { key: "quizzResult", label: "Quizz+" },

    isAuthenticated && data.cloud && { key: "cloud", label: "Cloud" },
    data.video && { key: "video", label: "Vidéos" },
  ];
  const contentList = {
    contenu: <ContentBlock {...data} />,
    fichiers: <FilesBlock {...data} />,
    quizz: <Quizz {...data} />,
    quizzResult: <QuizzResult {...data} />,

  };

  if (data.video) {
    contentList.video = <VideoBlock {...data} />;
  }

  if (isAuthenticated) {
    contentList.cloud = <CloudBlock {...data}/>;
  }

  const iscontenu = activeTabKey === "contenu";
  const isvideo = activeTabKey === "video";

  return (
    <Card
      title={localTitle}
      extra={
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            Titre
          </span>
          <Popover
            placement="bottomRight"
            trigger="click"
            open={titlePopoverOpen}
            onOpenChange={(visible) => {
              setTitlePopoverOpen(visible);
              if (visible) {
                setPendingTitle(localTitle || "");
              }
            }}
            content={
              <Space align="start">
                <Input.TextArea
                  value={pendingTitle}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  autoFocus
                  maxLength={200}
                  placeholder="Nouveau titre"
                  onChange={(e) => setPendingTitle(e.target.value)}
                />
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  loading={isSavingTitle}
                  onClick={handleSaveTitle}
                />
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  disabled={isSavingTitle}
                  onClick={() => {
                    setTitlePopoverOpen(false);
                    setPendingTitle(localTitle || "");
                  }}
                />
              </Space>
            }
          >
            <Button
              icon={<EditOutlined />}
              size="small"
              type="default"
              className="flex items-center"
            />
          </Popover>
          <Button
            size="small"
            type="default"
            onClick={() => {
              const nextExpanded = isCollapsed;
              if (typeof data.onToggleExpand === "function") {
                data.onToggleExpand(nextExpanded);
              }
              if (data.expanded === undefined) {
                if (!isCollapsed) {
                  setActiveTabKey("contenu");
                }
                setIsCollapsed((prev) => !prev);
              }
            }}
            title={isCollapsed ? "Déplier" : "Replier"}
            icon={
              isCollapsed ? (
                <VerticalAlignBottomOutlined />
              ) : (
                <VerticalAlignTopOutlined />
              )
            }
          />
        </div>
      }
      style={{ width: "100%" }}
      tabList={tabList}
      activeTabKey={activeTabKey}
      onTabChange={onTabChange}
      className="shadow-md hover:shadow-xl transition-shadow duration-200"
      tabProps={{ size: "middle" }}
      styles={{ body: { padding: 8 } }}
      bodyStyle={
        isCollapsed
          ? { maxHeight: 0, overflow: "hidden", padding: 8, transition: "max-height 1s ease, padding 0.3s ease" }
          : { maxHeight: 2000, padding: 8, transition: "max-height 1s ease, padding 0.3s ease" }
      }
    >
      {contentList[activeTabKey]}
    </Card>
  );
};

export default CardBlock;
