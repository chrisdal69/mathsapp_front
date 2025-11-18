import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export default function Contenu({ num, repertoire, plan, presentation, bg }) {
  const racine = `https://storage.googleapis.com/mathsapp/${repertoire}/tag${num}/`;

  const toBlurFile = (filename) => {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot === -1) return `${filename}Blur`;
    return `${filename.slice(0, lastDot)}Blur${filename.slice(lastDot)}`;
  };

  const blurBg = useMemo(() => toBlurFile(bg), [bg]);
  console.log("presentation : ", presentation);
  console.log("plan : ", plan);

  return (
    <div className="group relative w-full min-h-[150px] ">
      <div className="flex flex-col break-words whitespace-pre-line min-w-0 mx-5">
        <div className="break-words w-full min-w-0 ">
          <p>Présentation :</p>
          <ul className="ml-5">
            {presentation.map((elt, i) => (
              <li>
                Phrase : {i + 1} : {elt}
              </li>
            ))}
          </ul>
          <p>Plan :</p>
          <ul className="ml-5">
            {plan.map((elt, i) => (
              <p>
                Chapitre : {i + 1} : {elt}
              </p>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-5  " >
        <p>Image backGround :</p> 
        <Image
          src={`${racine}${bg}`}
          alt="Logo"
          width={600}
          height={200}
          placeholder="blur"
          blurDataURL={`${racine}${blurBg}`}
          sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className={`max-w-full m-auto`}
        />
      </div>
    </div>
  );
}
