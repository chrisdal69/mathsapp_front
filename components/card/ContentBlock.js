import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export default function Contenu({ plan , presentation }) {
  const [typing, setTyping] = useState(false);
  const [typedText, setTypedText] = useState("");

  const combinedText = useMemo(() => {
    const numberedPlan = plan.map((elt, idx) => `${idx + 1}. ${elt}`);
    const lines = [...presentation, "", ...numberedPlan];
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

  return (
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
  );
}
