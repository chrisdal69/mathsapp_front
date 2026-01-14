import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Carousel, Input, message, Popover, Select, Tooltip, Upload } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { setCardsMaths } from "../../../reducers/cardsMathsSlice";

const NODE_ENV = process.env.NODE_ENV;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";
const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png"];
const MAX_FLASH_IMAGE_BYTES = 4 * 1024 * 1024;
const PREVIEW_IMAGE_WIDTH = 250;

const parseInlineKatex = (input) => {
  const tokens = [];
  const text = String(input ?? "");
  let buffer = "";
  let inMath = false;
  let hasUnmatched = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "\\") {
      const next = text[i + 1];
      if (next === "$") {
        buffer += "$";
        i += 1;
        continue;
      }
      buffer += char;
      continue;
    }
    if (char === "$") {
      if (inMath) {
        if (buffer.length === 0) {
          const last = tokens[tokens.length - 1];
          if (last && last.type === "text") {
            last.value += "$$";
          } else {
            tokens.push({ type: "text", value: "$$" });
          }
        } else {
          tokens.push({ type: "math", value: buffer });
        }
        buffer = "";
        inMath = false;
      } else {
        if (buffer.length > 0) {
          tokens.push({ type: "text", value: buffer });
        }
        buffer = "";
        inMath = true;
      }
      continue;
    }
    buffer += char;
  }

  if (inMath) {
    hasUnmatched = true;
    const literal = `$${buffer}`;
    const last = tokens[tokens.length - 1];
    if (last && last.type === "text") {
      last.value += literal;
    } else if (literal.length > 0) {
      tokens.push({ type: "text", value: literal });
    }
    return { parts: tokens, hasUnmatched };
  }

  if (buffer.length > 0) {
    tokens.push({ type: "text", value: buffer });
  }

  return { parts: tokens, hasUnmatched };
};

const renderInlineKatex = (input) => {
  const { parts, hasUnmatched } = parseInlineKatex(input);
  const nodes = parts.map((part, i) =>
    part.type === "text" ? (
      <Fragment key={`text-${i}`}>{part.value}</Fragment>
    ) : (
      <InlineMath key={`math-${i}`} math={part.value} />
    )
  );
  return { nodes, hasUnmatched };
};

export default function FlashBlock({ num, repertoire, flash, _id, id }) {
  const dispatch = useDispatch();
  const cardsData = useSelector((state) => state.cardsMaths.data);
  const carouselRef = useRef(null);
  const pendingSlideRef = useRef(null);

  const [current, setCurrent] = useState(0);
  const [flashList, setFlashList] = useState(Array.isArray(flash) ? flash : []);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [deleteCardOpen, setDeleteCardOpen] = useState(false);
  const [insertPos, setInsertPos] = useState("end");
  const [editText, setEditText] = useState({ id: null, field: null, value: "" });
  const [actionKey, setActionKey] = useState("");
  const [uploadingImageFor, setUploadingImageFor] = useState("");

  const cardId = _id || id;

  const racine = useMemo(
    () =>
      `https://storage.googleapis.com/${
        process.env.NEXT_PUBLIC_BUCKET_NAME || "mathsapp"
      }/${repertoire}/tag${num}/imagesFlash/`,
    [repertoire, num]
  );

  useEffect(() => {
    setFlashList(Array.isArray(flash) ? flash : []);
  }, [flash]);

  useEffect(() => {
    if (pendingSlideRef.current === null) return;
    if (!flashList.length) {
      pendingSlideRef.current = null;
      return;
    }
    const targetIndex = Math.min(
      Math.max(0, pendingSlideRef.current),
      flashList.length - 1
    );
    pendingSlideRef.current = null;
    setCurrent(targetIndex);
    carouselRef.current?.goTo(targetIndex);
  }, [flashList.length]);

  const DOT = 10;
  const GAP = 20;
  const trackWidth =
    (flashList.length || 1) * DOT + Math.max(0, flashList.length - 1) * GAP;

  const reindexFlash = (list) =>
    (Array.isArray(list) ? list : []).map((item, idx) => {
      const trimmedId = typeof item?.id === "string" ? item.id.trim() : "";
      return {
        id: trimmedId || `f${idx + 1}`,
        question: typeof item?.question === "string" ? item.question : "",
        imquestion: typeof item?.imquestion === "string" ? item.imquestion : "",
        reponse: typeof item?.reponse === "string" ? item.reponse : "",
        imreponse: typeof item?.imreponse === "string" ? item.imreponse : "",
      };
    });

  const resolveInsertIndex = (list, pos) => {
    const length = Array.isArray(list) ? list.length : 0;
    if (pos === "start") return 0;
    if (pos === "end" || pos === undefined || pos === null) return length;
    const numeric = Number(pos);
    if (!Number.isNaN(numeric)) {
      return Math.max(0, Math.min(length, numeric + 1));
    }
    return length;
  };

  const getActionKey = (mode, idPart, extra) =>
    [mode, idPart, extra].filter(Boolean).join("-");

  const isAction = (key) => actionKey === key;

  const syncCardsStore = (updatedCard, fallbackFlash) => {
    if (!cardsData || !Array.isArray(cardsData.result)) return;
    const targetId = updatedCard?._id || updatedCard?.id || cardId;
    const targetNum =
      typeof updatedCard?.num !== "undefined" ? updatedCard.num : num;
    const targetRepertoire = updatedCard?.repertoire || repertoire;
    const patch = updatedCard || { flash: fallbackFlash };

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
      return matchById || matchByComposite ? { ...card, ...patch } : card;
    });

    dispatch(setCardsMaths({ ...cardsData, result: nextResult }));
  };

  const persistFlash = async (
    nextFlash,
    { successMessage } = {},
    loadingKey = ""
  ) => {
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return false;
    }

    const payload = {
      flash: reindexFlash(nextFlash ?? flashList),
    };

    setActionKey(loadingKey);
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/flash`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Session expiree ou droits insuffisants. Merci de vous reconnecter."
        );
      }
      let data = null;
      try {
        data = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible d'enregistrer les modifications."
        );
      }
      const updatedCard = data?.result;
      if (updatedCard?.flash) {
        setFlashList(Array.isArray(updatedCard.flash) ? updatedCard.flash : []);
      } else {
        setFlashList(payload.flash);
      }
      syncCardsStore(updatedCard, payload.flash);
      if (successMessage) {
        message.success(successMessage);
      }
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des flash cards :", error);
      message.error(error.message || "Erreur lors de la sauvegarde.");
      return false;
    } finally {
      setActionKey("");
    }
  };

  const handlePrev = () => {
    setCurrent((c) => Math.max(0, c - 1));
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    setCurrent((c) => Math.min(flashList.length - 1, c + 1));
    carouselRef.current?.next();
  };

  const handleAddCard = async () => {
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }
    const insertIndex = resolveInsertIndex(flashList, insertPos);
    pendingSlideRef.current = insertIndex;
    setActionKey("add-flash");
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/flash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ position: insertPos }),
      });
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Session expiree ou droits insuffisants. Merci de vous reconnecter."
        );
      }
      let data = null;
      try {
        data = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(data?.error || "Impossible d'ajouter la flash card.");
      }
      const updatedCard = data?.result;
      if (updatedCard?.flash) {
        setFlashList(Array.isArray(updatedCard.flash) ? updatedCard.flash : []);
        syncCardsStore(updatedCard, updatedCard.flash);
      }
      message.success("Flash card ajoutee.");
      setAddCardOpen(false);
      setInsertPos("end");
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une flash card :", error);
      message.error(error.message || "Erreur lors de l'ajout.");
      pendingSlideRef.current = null;
    } finally {
      setActionKey("");
    }
  };

  const handleDeleteCard = async () => {
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }
    if (!flashList.length) {
      setDeleteCardOpen(false);
      return;
    }
    const nextIndex = Math.max(0, current - 1);
    pendingSlideRef.current = nextIndex;
    setActionKey("delete-flash");
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/flash`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          index: current,
          flashId: flashList[current]?.id,
        }),
      });
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Session expiree ou droits insuffisants. Merci de vous reconnecter."
        );
      }
      let data = null;
      try {
        data = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(data?.error || "Impossible de supprimer la flash card.");
      }
      const updatedCard = data?.result;
      if (updatedCard?.flash) {
        setFlashList(Array.isArray(updatedCard.flash) ? updatedCard.flash : []);
        syncCardsStore(updatedCard, updatedCard.flash);
      }
      message.success("Flash card supprimee.");
      setDeleteCardOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression d'une flash card :", error);
      message.error(error.message || "Erreur lors de la suppression.");
      pendingSlideRef.current = null;
    } finally {
      setActionKey("");
    }
  };

  const handleSaveText = async (flashId, field, valueOverride) => {
    if (!flashId || !field) return;
    const fallbackValue =
      flashList.find((q) => q.id === flashId)?.[field] || "";
    const value = (valueOverride ?? editText.value ?? fallbackValue).trim();
    const next = flashList.map((q) =>
      q.id === flashId ? { ...q, [field]: value } : q
    );
    const ok = await persistFlash(
      next,
      {
        successMessage:
          field === "question"
            ? "Question mise a jour."
            : "Reponse mise a jour.",
      },
      getActionKey(field, flashId)
    );
    if (ok) {
      setEditText({ id: null, field: null, value: "" });
    }
  };

  const handleUploadImage = async (flashItem, field, file) => {
    if (!flashItem?.id || !file || !field) return;
    const ext = `.${(file.name || "").split(".").pop()?.toLowerCase() || ""}`;
    if (!ALLOWED_IMAGE_EXT.includes(ext)) {
      message.error("Image non autorisee (jpg ou png).");
      return;
    }
    if (file.size && file.size > MAX_FLASH_IMAGE_BYTES) {
      message.error("Fichier trop volumineux (4 Mo max).");
      return;
    }
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }

    const uploadKey = getActionKey("upload", flashItem.id, field);
    setUploadingImageFor(uploadKey);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("flashId", flashItem.id);
    formData.append("field", field);
    formData.append("repertoire", repertoire || "");
    formData.append("num", `${num}`);

    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/flash/image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Session expiree ou droits insuffisants. Merci de vous reconnecter."
        );
      }
      let data = null;
      try {
        data = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(data?.error || "Upload impossible.");
      }
      const updatedCard = data?.result;
      if (updatedCard?.flash) {
        setFlashList(Array.isArray(updatedCard.flash) ? updatedCard.flash : []);
        syncCardsStore(updatedCard, updatedCard.flash);
      }
      message.success("Image importee.");
    } catch (error) {
      console.error("Erreur upload image flash", error);
      message.error(error.message || "Erreur lors de l'upload.");
    } finally {
      setUploadingImageFor("");
    }
  };

  const handleDeleteImage = async (flashItem, field) => {
    if (!flashItem?.id || !field || !flashItem?.[field]) {
      return;
    }
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }
    const key = getActionKey("delete-image", flashItem.id, field);
    setActionKey(key);
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/flash/image`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          flashId: flashItem.id,
          field,
          image: flashItem[field],
          repertoire: repertoire || "",
          num,
        }),
      });
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Session expiree ou droits insuffisants. Merci de vous reconnecter."
        );
      }
      let data = null;
      try {
        data = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(data?.error || "Suppression impossible.");
      }
      const updatedCard = data?.result;
      if (updatedCard?.flash) {
        setFlashList(Array.isArray(updatedCard.flash) ? updatedCard.flash : []);
        syncCardsStore(updatedCard, updatedCard.flash);
      }
      message.success("Image supprimee.");
    } catch (error) {
      console.error("Erreur suppression image flash", error);
      message.error(error.message || "Erreur lors de la suppression.");
    } finally {
      setActionKey("");
    }
  };

  const handlePasteImage = (flashItem, field, event) => {
    if (!flashItem?.id || !field) return;
    const uploadKey = getActionKey("upload", flashItem.id, field);
    if (uploadingImageFor === uploadKey) return;
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type?.startsWith("image/"));
    if (!imageItem) return;
    event.preventDefault();

    const blob = imageItem.getAsFile();
    if (!blob) return;

    const mime = blob.type || "image/png";
    const ext =
      mime === "image/png"
        ? ".png"
        : mime === "image/jpeg" || mime === "image/jpg"
        ? ".jpg"
        : "";

    if (!ALLOWED_IMAGE_EXT.includes(ext)) {
      message.error("Image non autorisee (jpg ou png).");
      return;
    }

    const name =
      blob.name && blob.name.toLowerCase().endsWith(ext)
        ? blob.name
        : `capture-${Date.now()}${ext}`;
    const file = new File([blob], name, { type: mime });
    handleUploadImage(flashItem, field, file);
  };

  const handlePasteFromClipboard = async (flashItem, field) => {
    if (!flashItem?.id || !field) return;
    const uploadKey = getActionKey("upload", flashItem.id, field);
    if (uploadingImageFor === uploadKey) return;
    if (!navigator?.clipboard?.read) {
      message.error(
        "Le collage direct n'est pas disponible sur ce navigateur."
      );
      return;
    }

    try {
      const items = await navigator.clipboard.read();
      const imageItem = items.find((item) =>
        item.types.some((type) => type.startsWith("image/"))
      );
      if (!imageItem) {
        message.error("Aucune image dans le presse-papiers.");
        return;
      }
      const mime =
        imageItem.types.find((type) => type.startsWith("image/")) ||
        "image/png";
      const blob = await imageItem.getType(mime);
      if (!blob) return;
      const ext =
        mime === "image/png"
          ? ".png"
          : mime === "image/jpeg" || mime === "image/jpg"
          ? ".jpg"
          : "";
      if (!ALLOWED_IMAGE_EXT.includes(ext)) {
        message.error("Image non autorisee (jpg ou png).");
        return;
      }
      const name = `capture-${Date.now()}${ext}`;
      const file = new File([blob], name, { type: mime });
      handleUploadImage(flashItem, field, file);
    } catch (error) {
      console.error("Erreur collage image flash", error);
      message.error("Erreur lors du collage.");
    }
  };

  useEffect(() => {
    const handlePaste = (event) => {
      const active = document.activeElement;
      const indexAttr = active?.getAttribute?.("data-upload-flash-index");
      const fieldAttr = active?.getAttribute?.("data-upload-flash-field");
      if (indexAttr === null || typeof indexAttr === "undefined") return;
      if (fieldAttr !== "imquestion" && fieldAttr !== "imreponse") return;
      const index = Number(indexAttr);
      if (Number.isNaN(index)) return;
      const item = flashList[index];
      if (!item) return;
      handlePasteImage(item, fieldAttr, event);
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [flashList, handlePasteImage]);

  const insertionOptions = useMemo(() => {
    const options = [{ value: "start", label: "Debut (avant la premiere)" }];
    flashList.forEach((_, idx) =>
      options.push({ value: idx, label: `Apres carte ${idx + 1}` })
    );
    options.push({ value: "end", label: "Fin (apres la derniere)" });
    return options;
  }, [flashList]);

  const buildUploadProps = (flashItem, field) => ({
    accept: ALLOWED_IMAGE_EXT.join(","),
    showUploadList: false,
    beforeUpload: (file) => {
      handleUploadImage(flashItem, field, file);
      return false;
    },
  });

  return (
    <div className="relative w-full">
      <div className="relative z-20 p-4">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginBottom: 4,
              marginTop: 14,
            }}
          >
            {current > 0 && flashList.length > 0 && (
              <Button
                type="default"
                shape="circle"
                onClick={handlePrev}
                style={{
                  position: "relative",
                  top: "3px",
                  marginRight: "20px",
                  zIndex: 2,
                  background: "#fff",
                  transform: "translateY(-50%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                aria-label="Precedent"
              >
                <ChevronLeft size={18} />
              </Button>
            )}
            <div
              style={{
                position: "relative",
                width: trackWidth,
                height: 12,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  height: 1,
                  background: "#e5e5e5",
                  transform: "translateY(-50%)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {flashList.map((q, idx) => {
                  const isCurrent = idx === current;
                  const size = isCurrent ? DOT + 4 : DOT;
                  const dotColor = isCurrent ? "#595959" : "#d9d9d9";
                  return (
                    <div
                      key={q.id || `flash-${idx}`}
                      role="button"
                      onClick={() => {
                        setCurrent(idx);
                        carouselRef.current?.goTo(idx);
                      }}
                      style={{
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        backgroundColor: dotColor,
                        border: "1px solid #bfbfbf",
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                      aria-label={`Aller a la carte ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>
            {current < flashList.length - 1 && flashList.length > 0 && (
              <Button
                type="default"
                shape="circle"
                onClick={handleNext}
                style={{
                  position: "relative",
                  top: "3px",
                  marginLeft: "20px",
                  zIndex: 2,
                  background: "#fff",
                  transform: "translateY(-50%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                aria-label="Suivant"
              >
                <ChevronRight size={18} />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pb-3">
            <Popover
              placement="bottom"
              trigger="click"
              open={addCardOpen}
              onOpenChange={(visible) => setAddCardOpen(visible)}
              content={
                <div className="flex flex-col gap-2" style={{ maxWidth: 260 }}>
                  <p className="text-sm">
                    Choisir l'emplacement de la nouvelle flash card.
                  </p>
                  <Select
                    size="small"
                    value={insertPos}
                    options={insertionOptions}
                    onChange={(value) => setInsertPos(value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="small" onClick={() => setAddCardOpen(false)}>
                      Annuler
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      icon={<PlusOutlined />}
                      loading={isAction("add-flash")}
                      onClick={handleAddCard}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              }
            >
              <Tooltip title="Ajouter une flash card" mouseEnterDelay={0.3}>
                <Button type="dashed" icon={<PlusOutlined />}>
                  Ajouter une Flash Card
                </Button>
              </Tooltip>
            </Popover>

            <Popover
              placement="bottom"
              trigger="click"
              open={deleteCardOpen}
              onOpenChange={(visible) => setDeleteCardOpen(visible)}
              content={
                <div className="flex flex-col gap-2" style={{ maxWidth: 260 }}>
                  <p className="text-sm">Supprimer la flash card courante ?</p>
                  <div className="flex justify-end gap-2">
                    <Button size="small" onClick={() => setDeleteCardOpen(false)}>
                      Annuler
                    </Button>
                    <Button
                      size="small"
                      danger
                      type="primary"
                      icon={<DeleteOutlined />}
                      loading={isAction("delete-flash")}
                      onClick={handleDeleteCard}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              }
            >
              <Tooltip title="Supprimer la flash card" mouseEnterDelay={0.3}>
                <Button
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  disabled={!flashList.length}
                >
                  Supprimer cette Flash Card
                </Button>
              </Tooltip>
            </Popover>
          </div>

          {flashList.length === 0 ? (
            <Card className="w-full max-w-2xl text-center">
              <p className="text-sm text-gray-500">Aucune flash card.</p>
            </Card>
          ) : (
            <Carousel
              ref={carouselRef}
              dots
              swipe
              draggable
              infinite={false}
              beforeChange={(_, to) => setCurrent(to)}
              afterChange={(i) => setCurrent(i)}
              adaptiveHeight
              className="max-w-xs sm:max-w-2xl"
            >
              {flashList.map((q, idx) => {
                const initialQuestionValue = q.question || "";
                const initialReponseValue = q.reponse || "";
                const isEditingQuestion =
                  editText.id === q.id && editText.field === "question";
                const isEditingReponse =
                  editText.id === q.id && editText.field === "reponse";
                const questionValue = isEditingQuestion
                  ? editText.value
                  : initialQuestionValue;
                const reponseValue = isEditingReponse
                  ? editText.value
                  : initialReponseValue;
                const isQuestionEmpty = !questionValue.trim();
                const isReponseEmpty = !reponseValue.trim();
                const hasQuestionChanged =
                  questionValue !== initialQuestionValue;
                const hasReponseChanged = reponseValue !== initialReponseValue;
                const { nodes: questionNodes, hasUnmatched: questionHasError } =
                  renderInlineKatex(questionValue);
                const { nodes: reponseNodes, hasUnmatched: reponseHasError } =
                  renderInlineKatex(reponseValue);
                const questionImageKey = getActionKey(
                  "upload",
                  q.id,
                  "imquestion"
                );
                const reponseImageKey = getActionKey(
                  "upload",
                  q.id,
                  "imreponse"
                );
                return (
                  <div
                    key={q.id || `flash-${idx}`}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <Card
                      style={{
                        margin: "4px auto",
                        width: "100%",
                        maxWidth: "100%",
                        textAlign: "center",
                        padding: "0px",
                        backgroundColor: "rgba(100,100,100,0.2)",
                      }}
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-700">
                              Question
                            </p>
                            <Popover
                              trigger="click"
                              open={isEditingQuestion}
                              onOpenChange={(visible) => {
                                if (visible) {
                                  setEditText({
                                    id: q.id,
                                    field: "question",
                                    value: initialQuestionValue,
                                  });
                                } else if (isEditingQuestion) {
                                  setEditText({
                                    id: null,
                                    field: null,
                                    value: "",
                                  });
                                }
                              }}
                              content={
                                <div className="w-80 space-y-2">
                                  <Input.TextArea
                                    autoSize={{ minRows: 3, maxRows: 6 }}
                                    className="!font-normal"
                                    value={questionValue}
                                    maxLength={500}
                                    placeholder="Texte et formules avec $...$"
                                    onChange={(e) =>
                                      setEditText({
                                        id: q.id,
                                        field: "question",
                                        value: e.target.value,
                                      })
                                    }
                                  />
                                  <p className="text-xs text-gray-500">
                                    Utiliser $...$ pour les formules inline.
                                  </p>
                                  <div className="flex justify-end gap-2">
                                    <Tooltip
                                      title="Annuler"
                                      mouseEnterDelay={0.3}
                                    >
                                      <Button
                                        size="small"
                                        icon={<CloseOutlined />}
                                        onClick={() =>
                                          setEditText({
                                            id: null,
                                            field: null,
                                            value: "",
                                          })
                                        }
                                      >
                                        Annuler
                                      </Button>
                                    </Tooltip>
                                    <Tooltip
                                      title="Valider la modification"
                                      mouseEnterDelay={0.3}
                                    >
                                      <Button
                                        size="small"
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        loading={isAction(
                                          getActionKey("question", q.id)
                                        )}
                                        disabled={!hasQuestionChanged}
                                        onClick={() =>
                                          handleSaveText(
                                            q.id,
                                            "question",
                                            questionValue
                                          )
                                        }
                                      >
                                        Valider
                                      </Button>
                                    </Tooltip>
                                  </div>
                                </div>
                              }
                            >
                              <Tooltip
                                title={
                                  isQuestionEmpty
                                    ? "Saisir la question"
                                    : "Modifier la question"
                                }
                                mouseEnterDelay={0.3}
                              >
                                <Button size="small" icon={<EditOutlined />} />
                              </Tooltip>
                            </Popover>
                          </div>
                          <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-800">
                            {isQuestionEmpty ? (
                              <span className="text-gray-400">
                                Aucun intitule
                              </span>
                            ) : (
                              questionNodes
                            )}
                            {questionHasError && (
                              <span
                                style={{
                                  color: "#ff4d4f",
                                  marginLeft: 6,
                                  fontSize: 12,
                                }}
                              >
                                ($ non ferme)
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-700">
                                Image question
                              </p>
                              <div className="flex gap-2">
                                <Upload {...buildUploadProps(q, "imquestion")}>
                                  <Tooltip
                                    title="Importer une image"
                                    mouseEnterDelay={0.3}
                                  >
                                    <Button
                                      size="small"
                                      icon={<UploadOutlined />}
                                      loading={uploadingImageFor === questionImageKey}
                                      data-upload-flash-index={idx}
                                      data-upload-flash-field="imquestion"
                                    >
                                      Uploader
                                    </Button>
                                  </Tooltip>
                                </Upload>
                                <Tooltip
                                  title="Coller une image"
                                  mouseEnterDelay={0.3}
                                >
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      handlePasteFromClipboard(q, "imquestion")
                                    }
                                    disabled={uploadingImageFor === questionImageKey}
                                    data-upload-flash-index={idx}
                                    data-upload-flash-field="imquestion"
                                  >
                                    Coller
                                  </Button>
                                </Tooltip>
                                <Tooltip
                                  title="Supprimer l'image"
                                  mouseEnterDelay={0.3}
                                >
                                  <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    loading={isAction(
                                      getActionKey("delete-image", q.id, "imquestion")
                                    )}
                                    disabled={!q.imquestion}
                                    onClick={() => handleDeleteImage(q, "imquestion")}
                                  />
                                </Tooltip>
                              </div>
                            </div>
                            <div
                              className="flex items-center justify-center rounded border border-dashed border-gray-300 bg-white"
                              style={{
                                width: "90%",
                                margin: "auto",
                              }}
                            >
                              {q.imquestion ? (
                                <Image
                                  src={`${racine}${q.imquestion}`}
                                  alt=""
                                  width={PREVIEW_IMAGE_WIDTH}
                                  height={PREVIEW_IMAGE_WIDTH}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                  }}
                                />
                              ) : (
                                <span className="text-xs text-gray-500">
                                  Aucune image
                                </span>
                              )}
                            </div>
                            {q.imquestion && (
                              <p className="text-xs text-gray-500 break-all">
                                {q.imquestion}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-700">
                              Reponse
                            </p>
                            <Popover
                              trigger="click"
                              open={isEditingReponse}
                              onOpenChange={(visible) => {
                                if (visible) {
                                  setEditText({
                                    id: q.id,
                                    field: "reponse",
                                    value: initialReponseValue,
                                  });
                                } else if (isEditingReponse) {
                                  setEditText({
                                    id: null,
                                    field: null,
                                    value: "",
                                  });
                                }
                              }}
                              content={
                                <div className="w-80 space-y-2">
                                  <Input.TextArea
                                    autoSize={{ minRows: 3, maxRows: 6 }}
                                    className="!font-normal"
                                    value={reponseValue}
                                    maxLength={500}
                                    placeholder="Texte et formules avec $...$"
                                    onChange={(e) =>
                                      setEditText({
                                        id: q.id,
                                        field: "reponse",
                                        value: e.target.value,
                                      })
                                    }
                                  />
                                  <p className="text-xs text-gray-500">
                                    Utiliser $...$ pour les formules inline.
                                  </p>
                                  <div className="flex justify-end gap-2">
                                    <Tooltip
                                      title="Annuler"
                                      mouseEnterDelay={0.3}
                                    >
                                      <Button
                                        size="small"
                                        icon={<CloseOutlined />}
                                        onClick={() =>
                                          setEditText({
                                            id: null,
                                            field: null,
                                            value: "",
                                          })
                                        }
                                      >
                                        Annuler
                                      </Button>
                                    </Tooltip>
                                    <Tooltip
                                      title="Valider la modification"
                                      mouseEnterDelay={0.3}
                                    >
                                      <Button
                                        size="small"
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        loading={isAction(
                                          getActionKey("reponse", q.id)
                                        )}
                                        disabled={!hasReponseChanged}
                                        onClick={() =>
                                          handleSaveText(
                                            q.id,
                                            "reponse",
                                            reponseValue
                                          )
                                        }
                                      >
                                        Valider
                                      </Button>
                                    </Tooltip>
                                  </div>
                                </div>
                              }
                            >
                              <Tooltip
                                title={
                                  isReponseEmpty
                                    ? "Saisir la reponse"
                                    : "Modifier la reponse"
                                }
                                mouseEnterDelay={0.3}
                              >
                                <Button size="small" icon={<EditOutlined />} />
                              </Tooltip>
                            </Popover>
                          </div>
                          <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-800">
                            {isReponseEmpty ? (
                              <span className="text-gray-400">
                                Aucune reponse
                              </span>
                            ) : (
                              reponseNodes
                            )}
                            {reponseHasError && (
                              <span
                                style={{
                                  color: "#ff4d4f",
                                  marginLeft: 6,
                                  fontSize: 12,
                                }}
                              >
                                ($ non ferme)
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-700">
                                Image reponse
                              </p>
                              <div className="flex gap-2">
                                <Upload {...buildUploadProps(q, "imreponse")}>
                                  <Tooltip
                                    title="Importer une image"
                                    mouseEnterDelay={0.3}
                                  >
                                    <Button
                                      size="small"
                                      icon={<UploadOutlined />}
                                      loading={uploadingImageFor === reponseImageKey}
                                      data-upload-flash-index={idx}
                                      data-upload-flash-field="imreponse"
                                    >
                                      Uploader
                                    </Button>
                                  </Tooltip>
                                </Upload>
                                <Tooltip
                                  title="Coller une image"
                                  mouseEnterDelay={0.3}
                                >
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      handlePasteFromClipboard(q, "imreponse")
                                    }
                                    disabled={uploadingImageFor === reponseImageKey}
                                    data-upload-flash-index={idx}
                                    data-upload-flash-field="imreponse"
                                  >
                                    Coller
                                  </Button>
                                </Tooltip>
                                <Tooltip
                                  title="Supprimer l'image"
                                  mouseEnterDelay={0.3}
                                >
                                  <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    loading={isAction(
                                      getActionKey("delete-image", q.id, "imreponse")
                                    )}
                                    disabled={!q.imreponse}
                                    onClick={() => handleDeleteImage(q, "imreponse")}
                                  />
                                </Tooltip>
                              </div>
                            </div>
                            <div
                              className="flex items-center justify-center rounded border border-dashed border-gray-300 bg-white"
                              style={{
                                width: "90%",
                                margin: "auto",
                              }}
                            >
                              {q.imreponse ? (
                                <Image
                                  src={`${racine}${q.imreponse}`}
                                  alt=""
                                  width={PREVIEW_IMAGE_WIDTH}
                                  height={PREVIEW_IMAGE_WIDTH}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                  }}
                                />
                              ) : (
                                <span className="text-xs text-gray-500">
                                  Aucune image
                                </span>
                              )}
                            </div>
                            {q.imreponse && (
                              <p className="text-xs text-gray-500 break-all">
                                {q.imreponse}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </Carousel>
          )}
        </div>
      </div>
    </div>
  );
}
