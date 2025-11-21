import { useEffect, useRef, useState } from "react";
import { Button, Input, message } from "antd";
import { PlusOutlined, UploadOutlined, CloseOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setCardsMaths } from "../../../reducers/cardsMathsSlice";

const NODE_ENV = process.env.NODE_ENV;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";

export default function FilesBlock({ num, repertoire, fichiers, _id, id }) {
  const dispatch = useDispatch();
  const cardsData = useSelector((state) => state.cardsMaths.data);

  const [localFiles, setLocalFiles] = useState(
    Array.isArray(fichiers) ? fichiers : []
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const cardId = _id || id;

  useEffect(() => {
    setLocalFiles(Array.isArray(fichiers) ? fichiers : []);
  }, [fichiers]);

  // Icones officielles via Simple Icons CDN (logos officiels)
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
    // Python: logo bicolore officiel local
    if (e === "py") {
      return (
        <img
          src="/icons/python.svg"
          alt="Python"
          title="Python"
          className={className}
        />
      );
    }
    // Word: logo officiel local (W 2013-2019)
    if (e === "doc" || e === "docx") {
      return (
        <img
          src="/icons/word.svg"
          alt="Microsoft Word"
          title="Microsoft Word"
          className={className}
        />
      );
    }
    // PDF: tente Simple Icons (Acrobat) + fallback inline
    if (e === "pdf") {
      return (
        <BrandImg
          src={`https://cdn.simpleicons.org/adobeacrobatreader/FF0000`}
          alt="PDF"
          className={className}
          fallback={() => (
            <svg
              viewBox="0 0 24 24"
              role="img"
              aria-label="PDF"
              className={className}
            >
              <rect x="2" y="2" width="20" height="20" rx="3" fill="#E11D2A" />
              <text
                x="12"
                y="15"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#fff"
              >
                PDF
              </text>
            </svg>
          )}
        />
      );
    }
    // Office: Excel / PowerPoint via Simple Icons CDN (couleurs marque)
    if (e === "xls" || e === "xlsx" || e === "csv") {
      return (
        <BrandImg
          src={`https://cdn.simpleicons.org/microsoftexcel/107C41`}
          alt="Microsoft Excel"
          className={className}
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
        <BrandImg
          src={`https://cdn.simpleicons.org/markdown/000000`}
          alt="Markdown"
          className={className}
        />
      );
    }
    if (e === "zip" || e === "rar" || e === "7z") {
      // Dossier avec fermeture eclair (inline SVG, lisible sur fond clair)
      return (
        <svg
          viewBox="0 0 24 24"
          role="img"
          aria-label="Archive"
          className={className}
        >
          {/* Dossier */}
          <path
            d="M3 7a2 2 0 0 1 2-2h4.5l1.5 2H21a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"
            fill="#F59E0B"
          />
          <path d="M3 9h18v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" fill="#FBBF24" />
          {/* Fermeture eclair */}
          <rect x="11" y="6" width="2" height="2" rx="0.5" fill="#374151" />
          <rect x="11" y="9" width="2" height="2" rx="0.5" fill="#374151" />
          <rect x="11" y="12" width="2" height="2" rx="0.5" fill="#374151" />
          <rect x="11" y="15" width="2" height="2" rx="0.5" fill="#374151" />
          {/* Curseur de zip */}
          <path
            d="M11 17h2v2a1 1 0 0 1-1 1h0a1 1 0 0 1-1-1v-2z"
            fill="#6B7280"
          />
        </svg>
      );
    }
    if (
      e === "jpg" ||
      e === "jpeg" ||
      e === "png" ||
      e === "gif" ||
      e === "svg"
    ) {
      return (
        <svg
          viewBox="0 0 24 24"
          role="img"
          aria-label="Image"
          className={className}
        >
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#6D28D9" />
          <circle cx="9" cy="9" r="2" fill="#fff" />
          <path d="M4 18l5-5 3 3 3-3 5 5H4z" fill="#fff" />
        </svg>
      );
    }
    // Fallback generique
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label="Fichier"
        className={className}
      >
        <rect x="4" y="3" width="14" height="18" rx="2" fill="#9CA3AF" />
        <path d="M14 3v4a1 1 0 001 1h4" fill="#9CA3AF" />
        <path d="M14 3l5 5" stroke="#6B7280" strokeWidth="1" />
      </svg>
    );
  };

  const racine = `https://storage.googleapis.com/mathsapp/${repertoire}/tag${num}/`;

  const syncCardsStore = (updatedCard, fallbackFiles) => {
    if (!cardsData || !Array.isArray(cardsData.result)) {
      return;
    }

    const targetId = updatedCard?._id || updatedCard?.id || cardId;
    const targetNum =
      typeof updatedCard?.num !== "undefined" ? updatedCard.num : num;
    const patch = updatedCard || { fichiers: fallbackFiles };

    const nextResult = cardsData.result.map((card) => {
      const matchById =
        targetId && (card._id === targetId || card.id === targetId);
      const matchByNum =
        !matchById &&
        typeof targetNum !== "undefined" &&
        typeof card.num !== "undefined" &&
        card.num === targetNum;
      return matchById || matchByNum ? { ...card, ...patch } : card;
    });

    dispatch(setCardsMaths({ ...cardsData, result: nextResult }));
  };

  const resetForm = () => {
    setDescription("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event) => {
    const file = event?.target?.files?.[0];
    setSelectedFile(file || null);
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
      const nextFiles = Array.isArray(updatedCard?.fichiers)
        ? updatedCard.fichiers
        : [
            ...localFiles,
            {
              txt: trimmedDescription,
              href: payload?.fileName || selectedFile.name,
            },
          ];

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
    const name =
      elt.txt || elt.name || elt.label || elt.href || `fichier-${idx}`;
    const href = elt?.href ? `${racine}${elt.href}` : "#";

    const extFromHref = href.includes(".")
      ? href.split(".").pop().toLowerCase()
      : "";
    const extFromName = name.includes(".")
      ? name.split(".").pop().toLowerCase()
      : "";
    const ext = (extFromHref || extFromName || "").split(/[?#]/)[0];
    const icon = <FileTypeIcon ext={ext} className="w-5 h-5" />;
    return (
      <li key={`${name}-${idx}`} className="flex items-center gap-2 py-1">
        <span>{`Fichier ${idx+1} : `} </span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 underline decoration-blue-300 hover:decoration-blue-500"
        >
          <span className="shrink-0 text-lg leading-none">{icon}</span>
          <span className="truncate">{name}</span>
          {ext && (
            <span className="text-xs text-gray-500">({ext.toUpperCase()})</span>
          )}
        </a>
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
          onClick={() => setIsFormOpen((prev) => !prev)}
          disabled={isSubmitting}
        >
          {isFormOpen ? "Fermer" : "Nouveau fichier"}
        </Button>
      </div>

      {isFormOpen && (
        <div className="mb-4 rounded border border-dashed border-gray-300 bg-white/60 p-3 shadow-sm">
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Descriptif du fichier"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                className="text-sm"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <span className="text-xs text-gray-600">
                  Fichier : {selectedFile.name}
                </span>
              )}
            </div>
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
          </div>
        </div>
      )}

      {tab && tab.length > 0 ? (
        <ul className="list-none m-0 p-0 divide-y divide-gray-100">
          {tab}
        </ul>
      ) : (
        <p className="text-gray-600 text-sm">Aucun fichier disponible.</p>
      )}
    </div>
  );
}

