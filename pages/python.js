import React from "react";
import { Layout, theme } from "antd";
import Card from "../components/Card";

const { Content } = Layout;

const data = {
  num: 3,
  cloud: true,
  image: "https://storage.googleapis.com/mathsapp/images/white_chalkboard_complex_1500x250.jpg",
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
      href: "https://storage.googleapis.com/mathsapp/python/tp3/tp3ComplexesDic.pdf",
    },
    {
      txt: "Même fichier en format word",
      href: "https://storage.googleapis.com/mathsapp/python/tp3/tp3ComplexesDic.docx",
    },
  ],
  questions: [
    {
      id: "q1",
      question: "Que s'affiche-t-il dans la console ?",
      type: "single",
      image: "https://storage.googleapis.com/mathsapp/images/im1.jpg",
      options: [
        "{'voiture': 'véhicule à quatre roues', 'tricycle': 'véhicule à trois roues'}",
        "{'voiture': 'véhicule à quatre roues'}",
      ],
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
      options: ["Message d'erreur", "loups", "chiens"],
      correct: 1,
    },
  ],
    video:["https://www.youtube.com/embed/a10AeJ_o-44?si=sDXBu8MA9SifO1NJ"],

};

export default function PythonPage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Content>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 20,
            padding: 15,
            borderRadius: borderRadiusLG,
            marginTop: 0,
          }}
          className="flex flex-col  gap-y-20 items-center"
        >
          <Card {...data} />
        </div>
      </Content>
    </Layout>
  );
}
