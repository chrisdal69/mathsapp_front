import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "antd";
import ContentBlock from "./card/ContentBlock";
import FilesBlock from "./card/FilesBlock";
import CloudBlock from "./card/CloudBlock";
import Quizz from "./card/QuizzBlock";

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
      txt: "Activité complexe et dic0tionnaire ",
      href: "https://storage.googleapis.com/mathsapp/python/tp3ComplexesDic.pdf",
    },
    {
      txt: "En format word",
      href: "https://storage.googleapis.com/mathsapp/python/coursFctsAffineCorrige.docx",
    },
    {
      txt: "Corrigé ",
      href: "https://storage.googleapis.com/mathsapp/python/stats.py",
    },
    {
      txt: "Données",
      href: "https://storage.googleapis.com/mathsapp/python/js.zip",
    },
  ],
  questions: [
     {
      id: "q1",
      question: "Que s'affiche-t-il dans la console ?",
      type: "single",
      image: "https://storage.googleapis.com/mathsapp/images/im1.jpg",
      options: ["{'voiture': 'véhicule à quatre roues', 'tricycle': 'véhicule à trois roues'}", "{'voiture': 'véhicule à quatre roues'}"],
      correct: 0,
    },
    {
      id: "q2",
      question: "Que s'affiche-t-il dans la console ?",
      type: "single",
      image: "https://storage.googleapis.com/mathsapp/images/im2.jpg",
      options: ["Un message d'erreur", "Ce dictionnaire a 3 clés"],
      correct: 1,
    },
   
    {
      id: "q3",
      question: "Que s'affiche-t-il dans la console ?",
      type: "single",
      image: "https://storage.googleapis.com/mathsapp/images/im3.jpg",
      options: ["Message d'erreur", "Rien ne s'affiche", 4],
      correct: 2,
    },
        {
      id: "q4",
      question: "Que s'affiche-t-il dans la console ?",
      type: "single",
      image: "https://storage.googleapis.com/mathsapp/images/im4.jpg",
      options: ["voiture 4 vélo 2 ", "Message d'erreur"],
      correct: 0,
    },
     {
      id: "q5",
      question: "Que s'affiche-t-il dans la console ?",
      type: "single",
      image: "https://storage.googleapis.com/mathsapp/images/im5.jpg",
      options: ["Message d'erreur", "loups" , "chiens"],
      correct: 1,
    },
  ],
};

const CardBlock = () => {
  const [activeTabKey, setActiveTabKey] = useState("contenu");
  const onTabChange = (key) => setActiveTabKey(key);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(()=>{
    !isAuthenticated && activeTabKey==="cloud" && setActiveTabKey("contenu");
  },[isAuthenticated])

  const tabList = [
    { key: "contenu", label: "Contenu" },
    { key: "fichiers", label: "Fichiers" },
    { key: "quizz", label: "Quizz" },
    isAuthenticated && { key: "cloud", label: "Cloud" },
  ];
  const contentList = {
    contenu: <ContentBlock {...data} />,
    fichiers: <FilesBlock {...data} />,
    quizz: <Quizz {...data} />,
  };
  if (isAuthenticated){contentList.cloud = <CloudBlock />};
  const iscontenu = activeTabKey === "contenu";
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
        bodyStyle={iscontenu ? { padding: 1 } : undefined}
      >
        {contentList[activeTabKey]}
      </Card>
    </>
  );
};

export default CardBlock;
