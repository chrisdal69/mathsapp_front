import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { Button, Input, Popover, Select, Tooltip, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setCardsMaths } from "../../../reducers/cardsMathsSlice";

const NODE_ENV = process.env.NODE_ENV;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";
const EMPTY_SENTINEL = "\u200B"; // Persist an "empty-looking" item through backend trimming.
const MAX_BG_BYTES = 4 * 1024 * 1024;

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

const normalizeEmptyValue = (value) =>
  value === EMPTY_SENTINEL ? "" : value || "";

export default function Contenu({
  _id,
  id,
  num,
  repertoire,
  plan = [],
  presentation = [],
  bg,
}) {
  const dispatch = useDispatch();
  const cardsData = useSelector((state) => state.cardsMaths.data);

  const [localPresentation, setLocalPresentation] = useState(
    Array.isArray(presentation) ? presentation : []
  );
  const [localPlan, setLocalPlan] = useState(Array.isArray(plan) ? plan : []);
  const [insertPositions, setInsertPositions] = useState({
    presentation: "end",
    plan: "end",
  });
  const [editContext, setEditContext] = useState({ type: null, index: null });
  const [deleteContext, setDeleteContext] = useState({
    type: null,
    index: null,
  });
  const [editValue, setEditValue] = useState("");
  const [actionKey, setActionKey] = useState("");
  const [localBg, setLocalBg] = useState(bg || "");
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalPresentation(Array.isArray(presentation) ? presentation : []);
  }, [presentation]);

  useEffect(() => {
    setLocalPlan(Array.isArray(plan) ? plan : []);
  }, [plan]);

  useEffect(() => {
    const nextBg = bg || "";
    setLocalBg(nextBg);
  }, [bg]);

  const racine = `https://storage.googleapis.com/${
    process.env.NEXT_PUBLIC_BUCKET_NAME || "mathsapp"
  }/${repertoire}/tag${num}/`;

  const toBlurFile = (filename) => {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot === -1) return `${filename}Blur`;
    return `${filename.slice(0, lastDot)}Blur${filename.slice(lastDot)}`;
  };

  const blurBg = useMemo(() => (localBg ? toBlurFile(localBg) : ""), [localBg]);
  const cardId = _id || id;

  const listConfigs = {
    presentation: {
      title: "Présentation",
      placeholder: "Nouveau paragraphe",
      empty: "Aucune paragraphe enregistré.",
      label: "Paragraphe",
      success: {
        add: "Paragraphe ajoutée.",
        edit: "Paragraphe mise à jour.",
        delete: "Paragraphe supprimé.",
      },
    },
    plan: {
      title: "Plan",
      placeholder: "Nouveau chapitre",
      empty: "Aucun chapitre enregistré.",
      label: "Chapitre",
      success: {
        add: "Chapitre ajouté.",
        edit: "Chapitre mis à jour.",
        delete: "Chapitre supprimé.",
      },
    },
  };

  const getActionKey = (mode, type, index) =>
    [mode, type, typeof index === "number" ? index : ""]
      .filter((segment) => segment !== "")
      .join("-");

  const isActionInProgress = (mode, type, index) =>
    actionKey === getActionKey(mode, type, index);

  const getListForType = (type) =>
    type === "presentation" ? localPresentation : localPlan;

  const setListForType = (type, nextList) => {
    if (type === "presentation") {
      setLocalPresentation(nextList);
    } else {
      setLocalPlan(nextList);
    }
  };

  const insertAt = (list, value, index) => {
    if (!Array.isArray(list)) {
      return [value];
    }
    const safeIndex =
      typeof index === "number"
        ? Math.max(0, Math.min(index, list.length))
        : list.length;
    const copy = [...list];
    copy.splice(safeIndex, 0, value);
    return copy;
  };

  const getInsertIndex = (type) => {
    const list = getListForType(type);
    const pos = insertPositions[type];
    if (pos === "start") {
      return 0;
    }
    if (list.length === 0 || pos === "end" || typeof pos === "undefined") {
      return list.length;
    }
    if (typeof pos === "number" && !Number.isNaN(pos)) {
      return Math.min(list.length, Math.max(0, pos + 1));
    }
    return list.length;
  };

  const syncCardsStore = (updatedCard, fallbackList, typeName) => {
    if (!cardsData || !Array.isArray(cardsData.result)) {
      return;
    }

    const targetId = updatedCard?._id || updatedCard?.id || _id || id;
    const targetNum =
      typeof updatedCard?.num !== "undefined" ? updatedCard.num : num;
    const targetRepertoire = updatedCard?.repertoire || repertoire || null;
    const patch = updatedCard || { [typeName]: fallbackList };

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

  const persistList = async (type, nextList, successMsg) => {
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return false;
    }

    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/${type}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [type]: nextList }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {}

      if (!response.ok) {
        throw new Error(
          payload?.error || "Impossible d'enregistrer la modification."
        );
      }

      const updatedCard = payload?.result;
      if (updatedCard) {
        setLocalPresentation(
          Array.isArray(updatedCard.presentation)
            ? updatedCard.presentation
            : []
        );
        setLocalPlan(Array.isArray(updatedCard.plan) ? updatedCard.plan : []);
      } else {
        setListForType(type, nextList);
      }

      syncCardsStore(updatedCard, nextList, type);
      if (successMsg) {
        message.success(successMsg);
      }

      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de ${type}`, error);
      message.error(error.message || "Erreur lors de la sauvegarde.");
      return false;
    }
  };

  const handleBackgroundButtonClick = () => {
    if (isUploadingBg) {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleBackgroundInputChange = async (event) => {
    const target = event?.target;
    const file = target?.files?.[0];
    if (!file) return;
    target.value = "";
    await uploadBackgroundFile(file);
  };

  const uploadBackgroundFile = async (file) => {
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }
    if (!repertoire) {
      message.error("Répertoire manquant.");
      return;
    }
    const normalizedNum = Number(num);
    if (!Number.isFinite(normalizedNum)) {
      message.error("Numéro de tag invalide.");
      return;
    }

    if (file?.size && file.size > MAX_BG_BYTES) {
      message.error("Fichier trop volumineux (4 Mo max)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("repertoire", repertoire);
    formData.append("num", `${normalizedNum}`);

    setIsUploadingBg(true);
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/bg/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {}

      if (!response.ok) {
        throw new Error(payload?.error || "Impossible d'envoyer l'image.");
      }

      const updatedCard = payload?.result;
      const nextBg = updatedCard?.bg || "";
      if (nextBg) {
        setLocalBg(nextBg);
      }
      syncCardsStore(updatedCard, nextBg, "bg");
      message.success("Image importée.");
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image de fond", error);
      message.error(error.message || "Erreur lors de l'upload.");
    } finally {
      setIsUploadingBg(false);
    }
  };

  const closeEditPopover = () => {
    setEditContext({ type: null, index: null });
    setEditValue("");
  };

  const closeDeletePopover = () => {
    setDeleteContext({ type: null, index: null });
  };

  const handleAddItem = async (type) => {
    const config = listConfigs[type];
    if (!config) return;

    const nextList = insertAt(
      getListForType(type),
      EMPTY_SENTINEL,
      getInsertIndex(type)
    );
    const key = getActionKey("add", type);
    setActionKey(key);
    await persistList(type, nextList, config.success.add);
    setActionKey("");
  };

  const handleSaveEdit = async () => {
    const { type, index } = editContext;
    if (type === null || index === null) {
      return;
    }

    const config = listConfigs[type];
    const value = editValue.trim();
    if (!value) {
      message.error("Le champ ne peut pas être vide.");
      return;
    }

    const nextList = [...getListForType(type)];
    nextList[index] = value;
    const key = getActionKey("edit", type, index);
    setActionKey(key);
    const success = await persistList(type, nextList, config.success.edit);
    setActionKey("");
    if (success) {
      closeEditPopover();
    }
  };

  const handleDeleteItem = async () => {
    const { type, index } = deleteContext;
    if (type === null || index === null) {
      return;
    }

    const config = listConfigs[type];
    const nextList = getListForType(type).filter((_, idx) => idx !== index);
    const key = getActionKey("delete", type, index);
    setActionKey(key);
    const success = await persistList(type, nextList, config.success.delete);
    setActionKey("");
    if (success) {
      closeDeletePopover();
    }
  };

  const renderEditContent = (type, index) => (
    <div className="flex w-64 flex-col gap-2">
      <Input.TextArea
        autoFocus
        value={editValue}
        maxLength={500}
        autoSize={{ minRows: 2, maxRows: 5 }}
        placeholder="Texte et formules avec $...$"
        onChange={(e) => setEditValue(e.target.value)}
      />
      <p className="text-xs text-gray-500">
        Utiliser $...$ pour les formules inline.
      </p>
      <div className="flex justify-end gap-2">
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          loading={isActionInProgress("edit", type, index)}
          onClick={handleSaveEdit}
        >
          Valider
        </Button>
        <Button
          size="small"
          icon={<CloseOutlined />}
          onClick={closeEditPopover}
        >
          Annuler
        </Button>
      </div>
    </div>
  );

  const renderDeleteContent = (type, index) => {
    const config = listConfigs[type];
    return (
      <div className="w-56">
        <p className="text-sm text-gray-700">
          Supprimer {config.label.toLowerCase()} {index + 1} ?
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <Button
            danger
            size="small"
            loading={isActionInProgress("delete", type, index)}
            onClick={handleDeleteItem}
          >
            Supprimer
          </Button>
          <Button size="small" onClick={closeDeletePopover}>
            Annuler
          </Button>
        </div>
      </div>
    );
  };

  const renderListSection = (type) => {
    const list = getListForType(type);
    const config = listConfigs[type];
    const insertionOptions = [
      { value: "start", label: "Début (avant le premier)" },
      ...list.map((_, idx) => ({
        value: idx,
        label: `Après ${config.label.toLowerCase()} ${idx + 1}`,
      })),
      { value: "end", label: "Fin (après le dernier)" },
    ];
    return (
      <section
        key={type}
        className="mb-6 rounded-lg bg-white/60 p-1 md:p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-base font-semibold text-gray-800">
            {config.title}
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:items-start">
            <Select
              className="w-full sm:w-56"
              value={insertPositions[type]}
              options={insertionOptions}
              onChange={(value) =>
                setInsertPositions((prev) => ({ ...prev, [type]: value }))
              }
            />
            <Tooltip
              title={`Ajouter ${config.label.toLowerCase()}`}
              mouseEnterDelay={0.3}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={isActionInProgress("add", type)}
                onClick={() => handleAddItem(type)}
                className="shrink-0"
              >
                Ajouter
              </Button>
            </Tooltip>
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          {list.length ? (
            list.map((text, index) => {
              const isEditOpen =
                editContext.type === type && editContext.index === index;
              const isDeleteOpen =
                deleteContext.type === type && deleteContext.index === index;
              const displayValue = isEditOpen
                ? editValue
                : normalizeEmptyValue(text);
              const { nodes: renderedValue, hasUnmatched } =
                renderInlineKatex(displayValue);

              return (
                <li
                  key={`${type}-${index}`}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-1 md:p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {config.label} {index + 1}
                    </p>
                    <p className="whitespace-pre-line break-words text-sm text-gray-800">
                      {displayValue ? (
                        renderedValue
                      ) : (
                        <span className="text-gray-400">vide</span>
                      )}
                      {displayValue && hasUnmatched && (
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
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Popover
                      trigger="click"
                      placement="left"
                      open={isEditOpen}
                      onOpenChange={(visible) => {
                        if (visible) {
                          setEditContext({ type, index });
                          setEditValue(normalizeEmptyValue(text));
                        } else if (isEditOpen) {
                          closeEditPopover();
                        }
                      }}
                      content={renderEditContent(type, index)}
                    >
                      <Tooltip
                        title={`Modifier ${config.label.toLowerCase()} ${
                          index + 1
                        }`}
                        mouseEnterDelay={0.3}
                      >
                        <Button
                          icon={<EditOutlined />}
                          size="small"
                          type="default"
                        />
                      </Tooltip>
                    </Popover>
                    <Popover
                      trigger="click"
                      placement="left"
                      open={isDeleteOpen}
                      onOpenChange={(visible) => {
                        if (visible) {
                          setDeleteContext({ type, index });
                        } else if (isDeleteOpen) {
                          closeDeletePopover();
                        }
                      }}
                      content={renderDeleteContent(type, index)}
                    >
                      <Tooltip
                        title={`Supprimer ${config.label.toLowerCase()} ${
                          index + 1
                        }`}
                        mouseEnterDelay={0.3}
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          size="small"
                          danger
                          type="default"
                        />
                      </Tooltip>
                    </Popover>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="text-sm text-gray-500">{config.empty}</li>
          )}
        </ul>
      </section>
    );
  };

  return (
    <div className="group relative w-full min-h-[150px]">
      <div className="flex flex-col gap-6 ">
        <div className="flex min-w-0 flex-1 flex-col gap-4 px-5 py-4">
          {renderListSection("presentation")}
          {renderListSection("plan")}
        </div>
        <div className="mx-5 flex flex-col items-center gap-2 pb-4">
          <div className="flex  items-center gap-3">
            <p className="text-sm font-medium text-gray-700">
              Image background :
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBackgroundInputChange}
            />
            <Tooltip title="Changer l'image de fond" mouseEnterDelay={0.3}>
              <Button
                icon={<EditOutlined />}
                size="small"
                type="default"
                onClick={handleBackgroundButtonClick}
                loading={isUploadingBg}
                className="flex items-center"
              >
                {isUploadingBg ? "Upload..." : "Changer"}
              </Button>
            </Tooltip>
          </div>
          {localBg ? (
            <Image
              src={`${racine}${localBg}`}
              alt="Illustration de la carte"
              width={300}
              height={300}
              placeholder={blurBg ? "blur" : undefined}
              blurDataURL={blurBg ? `${racine}${blurBg}` : undefined}
              sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="max-w-full rounded-lg object-cover shadow"
            />
          ) : (
            <p className="text-sm text-gray-500">
              Aucun fichier d&#39;image défini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
