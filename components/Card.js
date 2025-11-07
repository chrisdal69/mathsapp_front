import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "antd";
import Cloud from "./DragAndDropUpload";
import complexe from "../public/complexe.png";
import Questionnaire from "./Questionnaire";

const data = {
  num: 3,
  titre: "Nombres complexes et dictionnaires",
  presentation: [
    `On découvre ici une nouvelle structure de données python : les DICTIONNAIRES. 
    Ils permettent de stocker des données dans une structure différente des listes pythons.`,
    `On se sert ensuite de cette nouvelle structure pour créer des fonctions qui permettront 
de réaliser des calculs algébriques sur des NOMBRES COMPLEXES.`,
  ],
  plan: [
    `Point cours : les dictionnaires en langage python`,
    `Application pour s'approprier les dictionnaires`,
    `Application sur les nombres complexes : introduction`,
    `Application sur les nombres complexes : travail à faire`,
  ],
  fichiers: [
    {
      txt: "Activité complexe et dictionnaire ",
      href: "https://storage.googleapis.com/mathsapp/python/tp3ComplexesDic.pdf",
    },
    {
      txt: "En format word",
      href:"https://storage.googleapis.com/mathsapp/python/coursFctsAffineCorrige.docx"
    },
    {
      txt: "Corrigé ",
      href: "https://storage.googleapis.com/mathsapp/python/stats.py",
    },
    {
      txt:"Données",
      href:"https://storage.googleapis.com/mathsapp/python/js.zip"
    }
  ],
};

const tabListNoTitle = [
  { key: "contenu", label: "Contenu" },
  { key: "fichiers", label: "Fichiers" },
  { key: "quizz", label: "Quizz" },
  { key: "cloud", label: "Cloud" },
];

const CardBlock = () => {
  const [activeTabKey, setActiveTabKey] = useState("contenu");
  const onTabChange = (key) => setActiveTabKey(key);

  // Effet dactylographié déclenché au survol de l'image
  const [typing, setTyping] = useState(false);
  const [typedText, setTypedText] = useState("");

  const combinedText = useMemo(() => {
    const numberedPlan = data.plan.map((elt, idx) => `${idx + 1}. ${elt}`);
    const lines = [...data.presentation, "", ...numberedPlan];
    return lines.join("\n");
  }, []);

  useEffect(() => {
    let timer;
    if (typing) {
      setTypedText("");
      let i = 0;
      const len = combinedText.length;
      timer = setInterval(() => {
        i += 1;
        setTypedText(combinedText.slice(0, i));
        if (i >= len) {
          clearInterval(timer);
        }
      }, 15);
    } else {
      setTypedText("");
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [typing, combinedText]);

// Icônes officielles via Simple Icons CDN (tracés officiels)
const BrandImg = ({ src, alt, title, className, fallback }) => {
  const [err, setErr] = useState(false);
  if (err && fallback) return typeof fallback === 'function' ? fallback() : fallback;
  return (
    <img src={src} alt={alt} title={title || alt} className={className} onError={() => setErr(true)} />
  );
};

const FileTypeIcon = ({ ext, className = "w-5 h-5" }) => {
  const e = (ext || "").toLowerCase();
  // Python: logo bicolore officiel local
  if (e === 'py') {
    return <img src="/icons/python.svg" alt="Python" title="Python" className={className} />;
  }
  // Word: logo officiel local (W 2013-2019)
  if (e === 'doc' || e === 'docx') {
    return <img src="/icons/word.svg" alt="Microsoft Word" title="Microsoft Word" className={className} />;
  }
  // PDF: tente Simple Icons (Acrobat) + fallback inline
  if (e === 'pdf') {
    return (
      <BrandImg
        src={`https://cdn.simpleicons.org/adobeacrobatreader/FF0000`}
        alt="PDF"
        className={className}
        fallback={() => (
          <svg viewBox="0 0 24 24" role="img" aria-label="PDF" className={className}>
            <rect x="2" y="2" width="20" height="20" rx="3" fill="#E11D2A" />
            <text x="12" y="15" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">PDF</text>
          </svg>
        )}
      />
    );
  }
  // Office: Excel / PowerPoint via Simple Icons CDN (couleurs marque)
  if (e === 'xls' || e === 'xlsx' || e === 'csv') {
    return <BrandImg src={`https://cdn.simpleicons.org/microsoftexcel/107C41`} alt="Microsoft Excel" className={className} />;
  }
  if (e === 'ppt' || e === 'pptx') {
    return <BrandImg src={`https://cdn.simpleicons.org/microsoftpowerpoint/D24726`} alt="Microsoft PowerPoint" className={className} />;
  }
  if (e === 'md') {
    return <BrandImg src={`https://cdn.simpleicons.org/markdown/000000`} alt="Markdown" className={className} />;
  }
  if (e === 'zip' || e === 'rar' || e === '7z') {
    // Dossier avec fermeture éclair (inline SVG, lisible sur fond clair)
    return (
      <svg viewBox="0 0 24 24" role="img" aria-label="Archive" className={className}>
        {/* Dossier */}
        <path d="M3 7a2 2 0 0 1 2-2h4.5l1.5 2H21a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" fill="#F59E0B"/>
        <path d="M3 9h18v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" fill="#FBBF24"/>
        {/* Fermeture éclair */}
        <rect x="11" y="6" width="2" height="2" rx="0.5" fill="#374151"/>
        <rect x="11" y="9" width="2" height="2" rx="0.5" fill="#374151"/>
        <rect x="11" y="12" width="2" height="2" rx="0.5" fill="#374151"/>
        <rect x="11" y="15" width="2" height="2" rx="0.5" fill="#374151"/>
        {/* Curseur de zip */}
        <path d="M11 17h2v2a1 1 0 0 1-1 1h0a1 1 0 0 1-1-1v-2z" fill="#6B7280"/>
      </svg>
    );
  }
  if (e === 'jpg' || e === 'jpeg' || e === 'png' || e === 'gif' || e === 'svg') {
    return (
      <svg viewBox="0 0 24 24" role="img" aria-label="Image" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#6D28D9" />
        <circle cx="9" cy="9" r="2" fill="#fff" />
        <path d="M4 18l5-5 3 3 3-3 5 5H4z" fill="#fff" />
      </svg>
    );
  }
  // Fallback générique
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Fichier" className={className}>
      <rect x="4" y="3" width="14" height="18" rx="2" fill="#9CA3AF" />
      <path d="M14 3v4a1 1 0 001 1h4" fill="#9CA3AF" />
      <path d="M14 3l5 5" stroke="#6B7280" strokeWidth="1" />
    </svg>
  );
};

const fichiers = (data.fichiers || []).map((elt, idx) => {
  const name = elt.txt || elt.name || elt.label || elt.href || `fichier-${idx}`;
  const href = elt.href || "#";
  const extFromHref = href.includes(".") ? href.split(".").pop().toLowerCase() : "";
  const extFromName = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  const ext = (extFromHref || extFromName || "").split(/[?#]/)[0];
  const icon = <FileTypeIcon ext={ext} className="w-5 h-5" />;
  return (
    <li key={`${name}-${idx}`} className="flex items-center gap-2 py-1">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 underline decoration-blue-300 hover:decoration-blue-500"
      >
        <span className="shrink-0 text-lg leading-none">{icon}</span>
        <span className="truncate">{name}</span>
        {ext && <span className="text-xs text-gray-500">({ext.toUpperCase()})</span>}
      </a>
    </li>
  );
});


  const contentListNoTitle = {
    contenu: (
      <div className="group relative w-full min-h-[150px] overflow-hidden">
        <div className="flex flex-col break-words whitespace-pre-line min-w-0 mx-5">
          {typing && (
            <div className="break-words w-full min-w-0">{typedText}</div>
          )}
        </div>

        <Image
          src="https://storage.googleapis.com/mathsapp/images/complexe.jpg"
          alt="Logo"
          fill
          placeholder="blur"
          blurDataURL="https://storage.googleapis.com/mathsapp/images/complexeBlur.jpg"
          sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover object-center opacity-100 transition-all duration-300 ease-out will-change-transform group-hover:opacity-0 group-hover:scale-105 group-hover:rotate-[0.5deg] group-hover:pointer-events-none"
        />

        <div
          className="absolute top-0 left-0 w-full h-[150px] z-10"
          onMouseEnter={() => setTyping(true)}
          onMouseLeave={() => setTyping(false)}
        />
      </div>
    ),
    fichiers: (
      <div className="p-2">
        {(fichiers && fichiers.length > 0) ? (
          <ul className="list-none m-0 p-0 divide-y divide-gray-100">{fichiers}</ul>
        ) : (
          <p className="text-gray-600 text-sm">Aucun fichier disponible.</p>
        )}
      </div>
    ),
    quizz: <Questionnaire />,
    cloud: <Cloud />,
  };

  const iscontenu = activeTabKey === "contenu";
  return (
    <>
      <Card
        title={data.titre}
        style={{ width: "100%" }}
        tabList={tabListNoTitle}
        activeTabKey={activeTabKey}
        onTabChange={onTabChange}
        className={` shadow-md hover:shadow-xl transition-shadow duration-200`}
        tabProps={{ size: "middle" }}
        bodyStyle={iscontenu ? { padding: 1 } : undefined}
      >
        {contentListNoTitle[activeTabKey]}
      </Card>
    </>
  );
};

export default CardBlock;
