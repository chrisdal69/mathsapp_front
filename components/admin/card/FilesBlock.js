import { useEffect, useState } from "react";
import { Button, Input, Popconfirm, Popover, Select, Upload, message } from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  CloseOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setCardsMaths } from "../../../reducers/cardsMathsSlice";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

const NODE_ENV = process.env.NODE_ENV;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";
const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt",
  ".md",
  ".py",
  ".zip",
  ".rar",
  ".7z",
  ".ppt",
  ".pptx",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".webp",
  ".mp4",
];
const { Dragger } = Upload;

const BrandImg = ({ src, alt, title, className, fallback }) => {
  const [err, setErr] = useState(false);
  if (err && fallback) {
    return typeof fallback === "function" ? fallback() : fallback;
  }
  return (
    <img
      src={src}
      alt={alt}
      title={title || alt}
      className={className}
      onError={() => setErr(true)}
    />
  );
};

const FileTypeIcon = ({ ext, className = "w-5 h-5" }) => {
  const e = (ext || "").toLowerCase();
  if (e === "py") {
    return <img src="/icons/python.svg" alt="Python" title="Python" className={className} />;
  }
  if (e === "doc" || e === "docx") {
    return <img src="/icons/word.svg" alt="Microsoft Word" title="Microsoft Word" className={className} />;
  }
  if (e === "pdf") {
    return (
      <BrandImg
        src={`https://cdn.simpleicons.org/adobeacrobatreader/FF0000`}
        alt="PDF"
        className={className}
        fallback={() => (
          <svg viewBox="0 0 24 24" role="img" aria-label="PDF" className={className}>
            <rect x="2" y="2" width="20" height="20" rx="3" fill="#E11D2A" />
            <text x="12" y="15" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
              PDF
            </text>
          </svg>
        )}
      />
    );
  }
  if (e === "xls" || e === "xlsx" || e === "csv") {
    return (
      <BrandImg
        src={`https://cdn.simpleicons.org/microsoftexcel/107C41`}
        alt="Microsoft Excel"
        className={className}
        fallback={() => (
          <svg viewBox="0 0 24 24" role="img" aria-label="Excel" className={className}>
            <rect x="2" y="3" width="20" height="18" rx="2" fill="#107C41" />
            <rect x="6" y="6" width="12" height="12" rx="1.5" fill="#fff" opacity="0.15" />
            <path d="M8 8l5 4-5 4V8z" fill="#fff" />
            <rect x="4" y="3" width="6" height="18" rx="1" fill="#0B5C30" opacity="0.9" />
            <path d="M6.2 10.5l1.2 1.8 1.2-1.8h1.3l-1.8 2.7 1.8 2.7H8.6l-1.2-1.8-1.2 1.8H4.7l1.8-2.7-1.8-2.7h1.5z" fill="#fff" />
          </svg>
        )}
      />
    );
  }
  if (e === "ppt" || e === "pptx") {
    return (
      <BrandImg
        src={`https://cdn.simpleicons.org/microsoftpowerpoint/D24726`}
        alt="Microsoft PowerPoint"
        className={className}
      />
    );
  }
  if (e === "md") {
    return (
      <BrandImg src={`https://cdn.simpleicons.org/markdown/000000`} alt="Markdown" className={className} />
    );
  }
  if (e === "zip" || e === "rar" || e === "7z") {
    return (
      <svg viewBox="0 0 24 24" role="img" aria-label="Archive" className={className}>
        <path d="M3 7a2 2 0 0 1 2-2h4.5l1.5 2H21a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" fill="#F59E0B" />
        <path d="M3 9h18v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" fill="#FBBF24" />
        <rect x="11" y="6" width="2" height="2" rx="0.5" fill="#374151" />
        <rect x="11" y="9" width="2" height="2" rx="0.5" fill="#374151" />
        <rect x="11" y="12" width="2" height="2" rx="0.5" fill="#374151" />
        <rect x="11" y="15" width="2" height="2" rx="0.5" fill="#374151" />
        <path d="M11 17h2v2a1 1 0 0 1-1 1h0a1 1 0 0 1-1-1v-2z" fill="#6B7280" />
      </svg>
    );
  }
  if (e === "jpg" || e === "jpeg" || e === "png" || e === "gif" || e === "svg") {
    return (
      <svg viewBox="0 0 24 24" role="img" aria-label="Image" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#6D28D9" />
        <circle cx="9" cy="9" r="2" fill="#fff" />
        <path d="M4 18l5-5 3 3 3-3 5 5H4z" fill="#fff" />
      </svg>
    );
  }
  if (e === "mp4") {
    return (
      <svg viewBox="0 0 24 24" role="img" aria-label="Video" className={className}>
        <rect x="2" y="5" width="20" height="14" rx="2" fill="#2563EB" />
        <rect x="4" y="7" width="12" height="10" rx="1" fill="#1D4ED8" />
        <path d="M15 9.5l4 2.5-4 2.5v-5z" fill="#BFDBFE" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Fichier" className={className}>
      <rect x="4" y="3" width="14" height="18" rx="2" fill="#9CA3AF" />
      <path d="M14 3v4a1 1 0 001 1h4" fill="#9CA3AF" />
      <path d="M14 3l5 5" stroke="#6B7280" strokeWidth="1" />
    </svg>
  );
};

export default function FilesBlock({ num, repertoire, fichiers, _id, id }) {
  const dispatch = useDispatch();
  const cardsData = useSelector((state) => state.cardsMaths.data);

  const [localFiles, setLocalFiles] = useState(Array.isArray(fichiers) ? fichiers : []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insertPosition, setInsertPosition] = useState("end");
  const [deletingKey, setDeletingKey] = useState("");
  const [editingKey, setEditingKey] = useState("");
  const [editingValue, setEditingValue] = useState("");
  const [editingLoadingKey, setEditingLoadingKey] = useState("");
  const cardId = _id || id;

  useEffect(() => {
    setLocalFiles(Array.isArray(fichiers) ? fichiers : []);
  }, [fichiers]);

  const racine = `https://storage.googleapis.com/mathsapp/${repertoire}/tag${num}/`;

  const syncCardsStore = (updatedCard, fallbackFiles) => {
    if (!cardsData || !Array.isArray(cardsData.result)) return;
    const targetId = updatedCard?._id || updatedCard?.id || cardId;
    const targetNum = typeof updatedCard?.num !== "undefined" ? updatedCard.num : num;
    const targetRepertoire = updatedCard?.repertoire || repertoire;
    const patch = updatedCard || { fichiers: fallbackFiles };
    const nextResult = cardsData.result.map((card) => {
      const matchById = targetId && (card._id === targetId || card.id === targetId);
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

  const resetForm = () => {
    setDescription("");
    setSelectedFile(null);
    setFileList([]);
    setInsertPosition("end");
  };

  const handleBeforeUpload = (file) => {
    const ext = `.${(file.name || "").split(".").pop()?.toLowerCase() || ""}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      message.error("Extension non autorisee pour ce fichier.");
      return Upload.LIST_IGNORE;
    }
    if (file.size && file.size > 100 * 1024 * 1024) {
      message.error("Fichier trop volumineux (100 Mo max).");
      return Upload.LIST_IGNORE;
    }
    setSelectedFile(file);
    setFileList([file]);
    return false;
  };

  const handleUploadChange = ({ fileList: newList }) => {
    if (!newList || newList.length === 0) {
      setSelectedFile(null);
      setFileList([]);
      return;
    }
    const last = newList[newList.length - 1]?.originFileObj;
    setSelectedFile(last || null);
    setFileList(last ? [newList[newList.length - 1]] : []);
  };

  const buildInsertionOptions = () => {
    const options = [{ value: "start", label: "Debut (avant le premier)" }];
    localFiles.forEach((file, idx) => {
      const name = file?.txt || file?.href || `fichier ${idx + 1}`;
      options.push({ value: idx, label: `Apres ${name}` });
    });
    options.push({ value: "end", label: "Fin (apres le dernier)" });
    return options;
  };

  const handleDeleteFile = async (file, key) => {
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }
    const href = file?.href;
    if (!href) {
      message.error("Fichier invalide.");
      return;
    }
    setDeletingKey(key);
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/files`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ href }),
      });
      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(payload?.error || "Suppression impossible.");
      }
      const updatedCard = payload?.result;
      const nextFiles = Array.isArray(updatedCard?.fichiers)
        ? updatedCard.fichiers
        : (localFiles || []).filter((f) => f?.href !== href);
      setLocalFiles(nextFiles);
      syncCardsStore(updatedCard, nextFiles);
      message.success("Fichier supprime.");
    } catch (error) {
      console.error("Erreur suppression fichier", error);
      message.error(error.message || "Erreur lors de la suppression.");
    } finally {
      setDeletingKey("");
    }
  };

  const handleEditFile = async (file, key) => {
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }
    const href = file?.href;
    if (!href) {
      message.error("Fichier invalide.");
      return;
    }
    const trimmed = (editingValue || "").trim();
    if (!trimmed) {
      message.error("Le descriptif est obligatoire.");
      return;
    }
    setEditingLoadingKey(key);
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/files`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ href, txt: trimmed }),
      });
      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(payload?.error || "Mise a jour impossible.");
      }
      const updatedCard = payload?.result;
      const nextFiles = Array.isArray(updatedCard?.fichiers)
        ? updatedCard.fichiers
        : (localFiles || []).map((f) => (f?.href === href ? { ...f, txt: trimmed } : f));
      setLocalFiles(nextFiles);
      syncCardsStore(updatedCard, nextFiles);
      message.success("Descriptif mis a jour.");
      setEditingKey("");
      setEditingValue("");
    } catch (error) {
      console.error("Erreur edition fichier", error);
      message.error(error.message || "Erreur lors de la mise a jour.");
    } finally {
      setEditingLoadingKey("");
    }
  };

  const insertAt = (list, value, position) => {
    const arr = Array.isArray(list) ? [...list] : [];
    if (position === "start") {
      arr.splice(0, 0, value);
      return arr;
    }
    if (position === "end" || typeof position === "undefined" || position === null) {
      arr.push(value);
      return arr;
    }
    const numeric = Number(position);
    if (!Number.isNaN(numeric)) {
      const clamped = Math.max(0, Math.min(arr.length, numeric + 1));
      arr.splice(clamped, 0, value);
      return arr;
    }
    arr.push(value);
    return arr;
  };

  const handleAddFile = async () => {
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }
    if (!repertoire) {
      message.error("Repertoire manquant.");
      return;
    }
    const normalizedNum = Number(num);
    if (!Number.isFinite(normalizedNum)) {
      message.error("Numero de tag invalide.");
      return;
    }
    const trimmedDescription = (description || "").trim();
    if (!trimmedDescription) {
      message.error("Le descriptif est obligatoire.");
      return;
    }
    if (!selectedFile) {
      message.error("Veuillez selectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("description", trimmedDescription);
    formData.append("repertoire", repertoire);
    formData.append("num", `${normalizedNum}`);
    formData.append("position", insertPosition);

    setIsSubmitting(true);
    try {
      const response = await fetch(`${urlFetch}/cards/${cardId}/files`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(payload?.error || "Impossible d'ajouter le fichier."); 
      }
      const updatedCard = payload?.result;
      const newEntry = { txt: trimmedDescription, href: payload?.fileName || selectedFile.name };
      const nextFiles = Array.isArray(updatedCard?.fichiers)
        ? updatedCard.fichiers
        : insertAt(localFiles, newEntry, insertPosition);

      setLocalFiles(nextFiles);
      syncCardsStore(updatedCard, nextFiles);
      message.success("Fichier ajoute.");
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du fichier :", error);
      message.error(error.message || "Erreur lors de l'ajout du fichier.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tab = (localFiles || []).map((elt, idx) => {
    const name = elt.txt || elt.name || elt.label || elt.href || `fichier-${idx}`;
    const href = elt?.href ? `${racine}${elt.href}` : "#";
    const deleteKey = `${elt?.href || idx}`;
    const isDeleting = deletingKey === deleteKey;
    const isEditingOpen = editingKey === deleteKey;
    const isEditingLoading = editingLoadingKey === deleteKey;

    const extFromHref = href.includes(".") ? href.split(".").pop().toLowerCase() : "";
    const extFromName = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
    const ext = (extFromHref || extFromName || "").split(/[?#]/)[0];
    const icon = <FileTypeIcon ext={ext} className="w-5 h-5" />;
    return (
      <li key={`${elt?.href || idx}`} className="flex items-center gap-2 py-1">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-0 flex-1 items-center gap-2 text-blue-700 hover:text-blue-900 underline decoration-blue-300 hover:decoration-blue-500"
          >
            <span className="shrink-0 text-lg leading-none">{icon}</span>
            <span className="break-words whitespace-normal">{name}</span>
            {ext && <span className="text-xs text-gray-500">({ext.toUpperCase()})</span>}
          </a>
        </div>
        {elt?.href && (
          <Popover
            trigger="click"
            open={isEditingOpen}
            onOpenChange={(visible) => {
              if (visible) {
                setEditingKey(deleteKey);
                setEditingValue(elt?.txt || "");
              } else if (isEditingOpen) {
                setEditingKey("");
                setEditingValue("");
              }
            }}
            content={
              <div className="flex w-64 flex-col gap-2">
                <Input
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  placeholder="Modifier le descriptif"
                  maxLength={200}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingKey("");
                      setEditingValue("");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                    loading={isEditingLoading}
                    onClick={() => handleEditFile(elt, deleteKey)}
                  >
                    Valider
                  </Button>
                </div>
              </div>
            }
          >
            <Button size="small" icon={<EditOutlined />} />
          </Popover>
        )}
        {elt?.href && (
          <Popconfirm
            title="Supprimer ce fichier ?"
            okText="Supprimer"
            cancelText="Annuler"
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
            okButtonProps={{ loading: isDeleting, danger: true }}
            onConfirm={() => handleDeleteFile(elt, deleteKey)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} loading={isDeleting} />
          </Popconfirm>
        )}
      </li>
    );
  });

  return (
    <div className="p-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-sm font-semibold text-gray-800">Fichiers</p>
        <Button
          size="small"
          type={isFormOpen ? "default" : "primary"}
          icon={<PlusOutlined />}
          onClick={() =>
            setIsFormOpen((prev) => {
              const next = !prev;
              if (!next) {
                resetForm();
              }
              return next;
            })
          }
          disabled={isSubmitting}
        >
          {isFormOpen ? "Fermer" : "Nouveau fichier"}
        </Button>
      </div>

      <div
        className={`mb-4 overflow-hidden rounded border border-dashed border-gray-300 bg-white/60 shadow-sm transition-all duration-1000 ease-in-out ${
          isFormOpen ? "max-h-[900px] opacity-100 p-3" : "max-h-0 opacity-0 p-0 pointer-events-none"
        }`}
        aria-hidden={!isFormOpen}
      >
        <div className="relative flex flex-col gap-3">
          <Input
            placeholder="Descriptif du fichier"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
          />
          <Select
            size="middle"
            value={insertPosition}
            onChange={setInsertPosition}
            options={buildInsertionOptions()}
          />
          <Dragger
            name="file"
            multiple={false}
            beforeUpload={handleBeforeUpload}
            onChange={handleUploadChange}
            fileList={fileList}
            accept={ALLOWED_EXTENSIONS.join(",")}
            showUploadList={{ showRemoveIcon: true, showPreviewIcon: false }}
            maxCount={1}
            onRemove={() => {
              setSelectedFile(null);
              setFileList([]);
            }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Glissez-deposez un fichier ou cliquez</p>
            <p className="ant-upload-hint">
              Extensions autorisees : {ALLOWED_EXTENSIONS.join(", ")} - 100 Mo max
            </p>
          </Dragger>
          <div className="flex justify-end gap-2">
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={() => {
                resetForm();
                setIsFormOpen(false);
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<UploadOutlined />}
              loading={isSubmitting}
              onClick={handleAddFile}
            >
              Ajouter
            </Button>
          </div>
          {isSubmitting && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <ClimbingBoxLoader color="#2563eb" size={14} speedMultiplier={1} />
            </div>
          )}
        </div>
      </div>

      {tab && tab.length > 0 ? (
        <ul className="list-none m-0 p-0 divide-y divide-gray-100">{tab}</ul>
      ) : (
        <p className="text-gray-600 text-sm">Aucun fichier disponible.</p>
      )}
    </div>
  );
}
