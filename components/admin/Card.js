import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Input, Popover, Space, message } from "antd";
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import ContentBlock from "./card/ContentBlock";
import FilesBlock from "./card/FilesBlock";
import CloudBlock from "./card/CloudBlock";
import VideoBlock from "./card/VideoBlock";
import Quizz from "./card/QuizzBlock";
import QuizzResult from "./card/QuizzResult";

import { setCardsMaths } from "../../reducers/cardsMathsSlice";

const NODE_ENV = process.env.NODE_ENV;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";

const CardBlock = (data) => {
  const [activeTabKey, setActiveTabKey] = useState("contenu");
  const [localTitle, setLocalTitle] = useState(data.titre);
  const [titlePopoverOpen, setTitlePopoverOpen] = useState(false);
  const [pendingTitle, setPendingTitle] = useState(data.titre || "");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isTogglingVisible, setIsTogglingVisible] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [moveConfirmDirection, setMoveConfirmDirection] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(
    data.expanded === undefined ? true : !data.expanded
  );

  const dispatch = useDispatch();
  const cardsData = useSelector((state) => state.cardsMaths.data);
  const { isAuthenticated } = useSelector((state) => state.auth);

  //console.log("visible dans admin/Cards: ",data.visible)
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

  const updateCardsStore = (updatedCard) => {
    if (!cardsData || !Array.isArray(cardsData.result) || !updatedCard) {
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
        return { ...card, ...updatedCard };
      }
      return card;
    });

    dispatch(setCardsMaths({ ...cardsData, result: nextResult }));
  };

  const removeCardFromStore = (target) => {
    if (!cardsData || !Array.isArray(cardsData.result)) {
      return;
    }
    const targetId = target?._id || target?.id || data?._id || data?.id;
    const targetNum =
      typeof target?.num !== "undefined" ? target.num : data?.num;
    const targetRepertoire = target?.repertoire || data?.repertoire || null;

    const nextResult = cardsData.result.filter((card) => {
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
      return !(matchById || matchByComposite);
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
      updateCardsStore(
        updatedCard || {
          _id: cardId,
          num: data?.num,
          repertoire: data?.repertoire,
          titre: nextTitle,
        }
      );
      message.success("Titre mis à jour.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du titre :", error);
      message.error(error.message || "Erreur lors de la mise à jour du titre.");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleToggleVisible = async () => {
    const cardId = data?._id || data?.id;
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }

    const nextVisible = !data?.visible;
    setIsTogglingVisible(true);
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/visible`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visible: nextVisible }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {}

      if (!response.ok) {
        throw new Error(
          payload?.error || "Impossible de mettre a jour la visibilite."
        );
      }

      const updatedCard =
        payload?.result || {
          _id: cardId,
          num: data?.num,
          repertoire: data?.repertoire,
          visible: nextVisible,
        };

      updateCardsStore(updatedCard);
      message.success(
        nextVisible ? "Carte rendue visible." : "Carte masquee."
      );
    } catch (error) {
      console.error("Erreur lors de la mise a jour de la visibilite :", error);
      message.error(
        error.message || "Erreur lors de la mise a jour de la visibilite."
      );
    } finally {
      setIsTogglingVisible(false);
    }
  };

  const handleDelete = async () => {
    const cardId = data?._id || data?.id;
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }

    if (deleteConfirmValue !== "DELETE") {
      message.error("Tapez DELETE pour confirmer.");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}`, {
        method: "DELETE",
        credentials: "include",
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {}

      if (!response.ok) {
        throw new Error(payload?.error || "Suppression impossible.");
      }

      removeCardFromStore(
        payload?.result || {
          _id: cardId,
          num: data?.num,
          repertoire: data?.repertoire,
        }
      );
      setDeletePopoverOpen(false);
      setDeleteConfirmValue("");
      message.success("Carte supprimée.");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      message.error(error.message || "Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (direction) => {
    const cardId = data?._id || data?.id;
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }

    if (!["up", "down"].includes(direction)) {
      return;
    }

    setIsMoving(true);
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ direction }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {}

      if (!response.ok) {
        throw new Error(payload?.error || "Impossible de déplacer la carte.");
      }

      if (payload?.result && Array.isArray(payload.result)) {
        const updatedSubset = payload.result;
        const existing = Array.isArray(cardsData?.result) ? cardsData.result : [];
        const merged = [
          ...existing.filter((c) => c?.repertoire !== data?.repertoire),
          ...updatedSubset,
        ];
        dispatch(setCardsMaths({ ...cardsData, result: merged }));
      }

      message.success("Carte déplacée.");
    } catch (error) {
      console.error("Erreur lors du déplacement :", error);
      message.error(error.message || "Erreur lors du déplacement.");
    } finally {
      setIsMoving(false);
    }
  };

  const onTabChange = (key) => {
    setActiveTabKey(key);
    if (typeof data.onTabChangeExternal === "function") {
      data.onTabChangeExternal(key);
    }
  };

  const renderMovePopoverContent = (direction) => {
    const isUp = direction === "up";
    return (
      <div className="flex flex-col gap-2" style={{ maxWidth: 260 }}>
        <p className="text-sm">
          {isUp
            ? "Déplacer la carte vers le haut ?"
            : "Déplacer la carte vers le bas ?"}
        </p>
        <div className="flex justify-end gap-2">
          <Button
            size="small"
            onClick={() => setMoveConfirmDirection(null)}
            disabled={isMoving}
          >
            Annuler
          </Button>
          <Button
            size="small"
            type="primary"
            loading={isMoving}
            onClick={() => {
              setMoveConfirmDirection(null);
              handleMove(direction);
            }}
          >
            Valider
          </Button>
        </div>
      </div>
    );
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

  const isVisible = data?.visible === true;
  const cardsList =
    (cardsData &&
      Array.isArray(cardsData.result) &&
      cardsData.result.filter((c) => !data?.repertoire || c?.repertoire === data.repertoire)) ||
    [];
  const cardId = data?._id || data?.id;
  const position = cardsList.findIndex(
    (c) => (c?._id || c?.id) && (c._id === cardId || c.id === cardId)
  );
  const canMoveUp = position > 0;
  const canMoveDown = position !== -1 && position < cardsList.length - 1;

  const titleNode = (
    <div className="flex flex-wrap items-center gap-2">
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
      <span className="font-semibold">{localTitle}</span>
    </div>
  );

  return (
    <Card
      title={titleNode}
      extra={
        <div className="flex flex-wrap items-center gap-2">
          {canMoveUp && (
            <Popover
              placement="bottom"
              trigger="click"
              open={moveConfirmDirection === "up"}
              onOpenChange={(visible) => {
                if (isMoving) return;
                setMoveConfirmDirection(visible ? "up" : null);
              }}
              content={renderMovePopoverContent("up")}
            >
              <Button
                size="small"
                type="default"
                disabled={isMoving}
                title="Monter"
                icon={<ArrowUpOutlined />}
              />
            </Popover>
          )}
          {canMoveDown && (
            <Popover
              placement="bottom"
              trigger="click"
              open={moveConfirmDirection === "down"}
              onOpenChange={(visible) => {
                if (isMoving) return;
                setMoveConfirmDirection(visible ? "down" : null);
              }}
              content={renderMovePopoverContent("down")}
            >
              <Button
                size="small"
                type="default"
                disabled={isMoving}
                title="Descendre"
                icon={<ArrowDownOutlined />}
              />
            </Popover>
          )}
          <Button
            size="small"
            type="default"
            onClick={handleToggleVisible}
            title={isVisible ? "Rendre invisible" : "Rendre visible"}
            loading={isTogglingVisible}
            icon={isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          />
          <Popover
            placement="bottomRight"
            trigger="click"
            open={deletePopoverOpen}
            onOpenChange={(visible) => {
              setDeletePopoverOpen(visible);
              if (visible) {
                setDeleteConfirmValue("");
              }
            }}
            content={
              <div className="flex flex-col gap-2" style={{ maxWidth: 260 }}>
                <p className="text-red-600 text-xs">
                  Cette action supprime la carte et tous ses fichiers du bucket.
                </p>
                <Input
                  size="small"
                  placeholder="Tapez DELETE"
                  value={deleteConfirmValue}
                  onChange={(e) => setDeleteConfirmValue(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="small"
                    onClick={() => {
                      setDeletePopoverOpen(false);
                      setDeleteConfirmValue("");
                    }}
                    disabled={isDeleting}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="small"
                    danger
                    type="primary"
                    loading={isDeleting}
                    onClick={handleDelete}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            }
          >
            <Button danger size="small" type="primary">
              Supprimer cette carte
            </Button>
          </Popover>
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
