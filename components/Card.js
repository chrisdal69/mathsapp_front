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
      <ul>
        <li>
          Tp (pdf) :
          <a
            href="https://storage.googleapis.com/mathsapp/python/tp3ComplexesDic.pdf"
            target="_blank"
          >
            <button>Enoncé</button>
          </a>
          <a
            href="https://storage.googleapis.com/mathsapp/python/tp3ComplexesDic.pdf"
            target="_blank"
          >
            <button>Corrigé</button>
          </a>
        </li>
        <li>
          Corrigé :
          <a
            href="https://storage.googleapis.com/mathsapp/python/stats.py"
            download
            target="_blank"
          >
            stats ( py )
          </a>
        </li>
      </ul>
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
