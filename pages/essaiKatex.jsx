import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

function essaiKatex() {
  const defaultFormula = String.raw`\lim_{x \to 0} \frac{\sin x}{x} = 1`;
  const [formule, setFormule] = useState(defaultFormula);
  const [formuleI, setFormuleI] = useState("");
  const [tabInline, setTabInline] = useState([]);

  const handleInline = (event) => {
    const value = event.target.value;
    setFormuleI(value);


    
    const tabFormuleI = value.split("$");

    const jsx = tabFormuleI.map((txt, i) => {
      if (i % 2 === 0) {
        return <React.Fragment key={`text-${i}`}>{txt}</React.Fragment>;
      }
      return <InlineMath key={`math-${i}`} math={txt} />;
    });
    setTabInline(jsx);
  };

  return (
    <div>
      <div className="bg-amber-100">
        <p>Pour du block :</p>
        <input
          type="text"
          value={formule}
          onChange={(e) => setFormule(e.target.value)}
          className="border w-1/2"
        />
        <p>Valeur saisie : {formule}</p>
        <BlockMath math={formule} />
      </div>

      <div className="bg-green-100">
        <p>Pour du Inline :</p>
        <input
          type="text"
          value={formuleI}
          onChange={handleInline}
          className="border w-1/2"
        />
        <p>Valeur saisie : {formuleI}</p>
        <p>{tabInline}</p>{" "}
      </div>
    </div>
  );
}

export default essaiKatex;
