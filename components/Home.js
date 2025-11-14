import React, { useState } from "react";
import { Layout, Menu, theme } from "antd";
const { Content } = Layout;
import EnTete from "./EnTete";
import Card from "./Card";

const data3 = {
  num: 3,
  cloud: false,
  image: "https://storage.googleapis.com/mathsapp/images/complexe.jpg",
  titre: "Nombres complexes - Forme algébrique",
  presentation: [
    `Le gros intérêt d’un nombre complexe est qu’il peut contenir dans une même entité, 2 informations : la partie réelle et la partie imaginaire ou le module et l’argument.`,
    `Comme pour les nombres classiques de la famille des réels, on pourra additionner, multiplier, diviser les nombres complexes.`,
  ],
  plan: [
    `Ensemble \u2102 des nombres complexes`,
    `Exemple de 2 nombres complexes : -4 + i et 2 + 2i`,
    `Utilité des nombres complexes`,
    `Addition`,
    `Multiplication`,
    `Addition`,
    `Conjugué et propriété du conjugué`,
    `Division`,
    `Exercices`,
  ],
  fichiers: [
    {
      txt: "Cours ",
      href: "https://storage.googleapis.com/mathsapp/ciel1/tag3/coursNombresComplexes.pdf",
    },
    {
      txt: "Même fichier en format word",
      href: "https://storage.googleapis.com/mathsapp/ciel1/tag3/coursNombresComplexes.docx",
    },
        {
      txt: "Exercices supplémentaires sur la multiplication en forme algébrique",
      href: "https://storage.googleapis.com/mathsapp/ciel1/tag3/multiplicationAlgebriqueCorrige.pdf",
    },
    {
      txt: "Exercices supplémentaires sur la division en forme algébrique",
      href: "https://storage.googleapis.com/mathsapp/ciel1/tag3/divisionAlgebriqueCorrige.pdf",
    },
  ],
  questions: [
    {
      id: "q1",
      question: "A quoi est égal i² ?",
      type: "single",
      //image: "https://storage.googleapis.com/mathsapp/images/im1.jpg",
      options: ["1", "-1", "c'est absurde", "0"],
      correct: 1,
    },
    {
      id: "q2",
      question: "Si z = 3 + 4i, quelle est sa partie imaginaire ?",
      type: "single",
      //image: "https://storage.googleapis.com/mathsapp/images/im2.jpg",
      options: ["3", "4i", "4", "-4"],
      correct: 2,
    },
    {
      id: "q3",
      question: "Quel est le conjugué de z = 2 - 5i ?",
      type: "single",
      //image: "https://storage.googleapis.com/mathsapp/images/im3.jpg",
      options: ["-2 - 5i", "-2 + 5i", "2 + 5i"],
      correct: 2,
    },
    {
      id: "q4",
      question:
        "Si z = a + bi  alors z\u0304 = a - bi. A quoi est égal z x z\u0304 ?  ",
      type: "single",
      //image: "https://storage.googleapis.com/mathsapp/images/im4.jpg",
      options: ["a²-b² ", "a²+b²"],
      correct: 1,
    },
    {
      id: "q5",
      question:
        "Si z = 2 + i  alors z\u0304 = 2 - i. A quoi est égal z x z\u0304 ?  ",
      type: "single",
      //image: "https://storage.googleapis.com/mathsapp/images/im5.jpg",
      options: ["3", "5", "4 + i"],
      correct: 1,
    },
    {
      id: "q6",
      question: "A quoi est égal i(2 + i) ?  ",
      type: "single",
      //image: "https://storage.googleapis.com/mathsapp/images/im5.jpg",
      options: ["1 + 2i", "-1 + 2i"],
      correct: 1,
    },
    {
      id: "q7",
      question: "A quoi est égal (2 + i) / i ?  ",
      type: "single",
      //image: "https://storage.googleapis.com/mathsapp/images/im5.jpg",
      options: ["1 - 2i", "-1 + 2i"],
      correct: 0,
    },
    {
      id: "q8",
      question: "Si z = 2 + 3i . A quoi est égal z x z\u0304 ?  ",
      type: "single",
      //image: "https://storage.googleapis.com/mathsapp/images/im5.jpg",
      options: ["4 + 9i", "13", "5i", "1"],
      correct: 1,
    },
  ],
  video: [
    "https://www.youtube.com/embed/-aaSfL2fhTY?si=SkmYt67tIQapIA3X",
    "https://www.youtube.com/embed/1KQIUqzVGqQ?si=7P7OwSwkQYi68MIr",
  ],
};
const data4 = {
  num: 4,
  cloud: false,
  image:
    "https://storage.googleapis.com/mathsapp/images/exponential_form_complex_1500x400.jpg",
  titre: "Nombres complexes - Forme exponentielle",
  presentation: [
    `La forme exponentielle d'un nombre complexe est largement utilisée en ingénierie et en sciences.`,
    `Par exemple, la forme exponentielle du nombre i est i = e i \u1D28 \u2044 2`,
    `Il ne faut pas s'en effrayer : il ne s'agit que d'une notation qui permet de simplifier certains calculs notamment ceux de multiplication et de division`,
  ],
  plan: [
    `Module |z| et argument \u0398 d'un nombre complexe`,
    `Propriétés sur la multiplication et la division`,
    `Définition de la forme exponentielle`,
    `Propriétés sur la multiplication en forme exponentielle`,
    `Propriétés sur la division en forme exponentielle`,
    `Exercices`,
  ],
  fichiers: [
    {
      txt: "Cours ",
      href: "https://storage.googleapis.com/mathsapp/ciel1/tag4/coursNombresComplexes2.pdf",
    },
    {
      txt: "Même fichier en format word",
      href: "https://storage.googleapis.com/mathsapp/ciel1/tag4/coursNombresComplexes2.docx",
    },
  ],
  questions: [
    {
      id: "q1",
      question: "Module et argument du nombre z=3i",
      type: "single",
      image:
        "https://storage.googleapis.com/mathsapp/ciel1/tag4/imagesQuizz/complexe1.jpg",
      options: ["|z| = 1 , \u0398 = \u1D28/2", "|z| = 1 , \u0398 = \u1D28"],
      correct: 0,
    },
    {
      id: "q2",
      question: "Module et argument du nombre z=-4",
      type: "single",
      image:
        "https://storage.googleapis.com/mathsapp/ciel1/tag4/imagesQuizz/complexe2.jpg",
      options: ["|z| = -4 , \u0398 = -\u1D28", "|z| = 4 , \u0398 = \u1D28"],
      correct: 0,
    },
    {
      id: "q3",
      question: "Module et argument du nombre z=4+4i",
      type: "single",
      image:
        "https://storage.googleapis.com/mathsapp/ciel1/tag4/imagesQuizz/complexe3.jpg",
      options: [
        "|z| = 4\u221A2 , \u0398 = \u1D28/4",
        "|z| = 2\u221A4 , \u0398 = \u1D28/4",
      ],
      correct: 0,
    },
    {
      id: "q4",
      question: "Module et argument du nombre z=-3-3i",
      type: "single",
      image:
        "https://storage.googleapis.com/mathsapp/ciel1/tag4/imagesQuizz/complexe4.jpg",
      options: [
        "|z| = -3\u221A2 , \u0398 = \u1D28/4",
        "|z| = 3\u221A2 , \u0398 = -3\u1D28/4",
      ],
      correct: 1,
    },
    {
      id: "q5",
      question: "|z| = 4 , \u0398 = \u1D28 . Quelle sa forme algébrique ?",
      type: "single",
      image:
        "https://storage.googleapis.com/mathsapp/ciel1/tag4/imagesQuizz/complexe5.jpg",
      options: ["z = -4 + 0i", "z = 4i"],
      correct: 0,
    },
    {
      id: "q6",
      question: "|z| = 3 , \u0398 = -\u1D28/2 . Quelle sa forme algébrique ?",
      type: "single",
      image:
        "https://storage.googleapis.com/mathsapp/ciel1/tag4/imagesQuizz/complexe6.jpg",
      options: ["z = 3", "z = -3i"],
      correct: 1,
    },
    {
      id: "q7",
      question: "Module et argument du nombre z=L\u03C9i",
      type: "single",
      image:
        "https://storage.googleapis.com/mathsapp/ciel1/tag4/imagesQuizz/complexe7.jpg",
      options: [
        "|z| = L\u03C9 , \u0398 = \u1D28/2",
        "|z| = -L\u03C9 , \u0398 = \u1D28",
      ],
      correct: 0,
    },
    {
      id: "q8",
      question: "Module et argument du nombre z=-Ci",
      type: "single",
      image:
        "https://storage.googleapis.com/mathsapp/ciel1/tag4/imagesQuizz/complexe8.jpg",
      options: ["|z| = C , \u0398 = \u1D28/2", "|z| = -C , \u0398 = \u1D28/2"],
      correct: 0,
    },
    {
      id: "q9",
      question: "Module et argument du nombre z=-R",
      type: "single",
      image:
        "https://storage.googleapis.com/mathsapp/ciel1/tag4/imagesQuizz/complexe9.jpg",
      options: ["|z| = -R , \u0398 = \u1D28", "|z| = R , \u0398 = \u1D28"],
      correct: 1,
    },
    {
      id: "q10",
      question: "Module et argument du nombre z=3-3i",
      type: "single",
      image:
        "https://storage.googleapis.com/mathsapp/ciel1/tag4/imagesQuizz/complexe10.jpg",
      options: [
        "|z| = -3\u221A2 , \u0398 = -\u1D28/4",
        "|z| = \u221A2 , \u0398 = -\u1D28/4",
      ],
      correct: 1,
    },
  ],
  video: [
    "https://www.youtube.com/embed/Hu0jjS5O2u4?si=7rhCz7clPQiRwS-5",
    "https://www.youtube.com/embed/NX3pzPL2gwc?si=-ak8BAEx0L2tgr5k",
    "https://www.youtube.com/embed/WSW6DIbCS_0?si=JCMs6FdggmVFm4Zb",
    "https://www.youtube.com/embed/zdxRt5poJp0?si=MAuxTN4i7AdBRrZz",
    "https://www.youtube.com/embed/8EVfyqyVBKc?si=kmVqKk-mBSO_Mqni",
  ],};
const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [reset1, setReset1] = useState(0);
  const [reset2, setReset2] = useState(0);
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
          className="flex flex-col  gap-y-10 items-center"
        >
          <div className="w-full">
            <Card
              {...data3}
              resetSignal={reset1}
              onTabChangeExternal={() => setReset2((v) => v + 1)}
            />
          </div>
          <div className="w-full">
            <Card
              {...data4}
              resetSignal={reset2}
              onTabChangeExternal={() => setReset1((v) => v + 1)}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};
export default App;
