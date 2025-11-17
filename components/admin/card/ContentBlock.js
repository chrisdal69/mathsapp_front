import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export default function Contenu({ num, repertoire, plan, presentation, bg }) {
  const [typing, setTyping] = useState(false);
  //const [typedText, setTypedText] = useState("");

  const racine = `https://storage.googleapis.com/mathsapp/${repertoire}/tag${num}/`;
  // const combinedText = useMemo(() => {
  //   const numberedPlan = plan.map((elt, idx) => `${idx + 1}. ${elt}`);
  //   const lines = [...presentation, "", ...numberedPlan];
  //   return lines.join("\n");
  // }, [plan, presentation]);

  // useEffect(() => {
  //   let timer;
  //   if (typing) {
  //     setTypedText("");
  //     let i = 0;
  //     const len = combinedText.length;
  //     timer = setInterval(() => {
  //       i += 1;
  //       setTypedText(combinedText.slice(0, i));
  //       if (i >= len) {
  //         clearInterval(timer);
  //       }
  //     }, 15);
  //   } else {
  //     setTypedText("");
  //   }
  //   return () => {
  //     if (timer) clearInterval(timer);
  //   };
  // }, [typing, combinedText]);

  const toBlurFile = (filename) => {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot === -1) return `${filename}Blur`;
    return `${filename.slice(0, lastDot)}Blur${filename.slice(lastDot)}`;
  };

  const blurBg = useMemo(() => toBlurFile(bg), [bg]);

  return (
    <div className="group relative w-full min-h-[150px] ">
      <div className="flex flex-col break-words whitespace-pre-line min-w-0 mx-5">
        {typing && (
          <div className="break-words w-full min-w-0 ">{presentation} ,{plan} </div>
        )}
      </div>

      <Image
        src={`${racine}${bg}`}
        alt="Logo"
        fill
        placeholder="blur"
        blurDataURL={`${racine}${blurBg}`}
        sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className={`object-cover object-center transition-opacity duration-300 ease-out ${
          typing ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      <div
        className="absolute inset-0 w-full h-full z-10 cursor-pointer"
        onMouseEnter={() => setTyping(true)}
        onMouseLeave={() => setTyping(false)}
        onTouchStart={() => setTyping(true)}
      />
    </div>
  );
}
