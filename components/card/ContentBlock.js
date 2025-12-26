import { Fragment, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

const parseInlineKatex = (input) => {
  const tokens = [];
  const text = String(input ?? "");
  let buffer = "";
  let inMath = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "\\") {
      const next = text[i + 1];
      if (next === "$") {
        buffer += "$";
        i += 1;
        continue;
      }
      buffer += char;
      continue;
    }
    if (char === "$") {
      if (inMath) {
        if (buffer.length === 0) {
          const last = tokens[tokens.length - 1];
          if (last && last.type === "text") {
            last.value += "$$";
          } else {
            tokens.push({ type: "text", value: "$$" });
          }
        } else {
          tokens.push({ type: "math", value: buffer });
        }
        buffer = "";
        inMath = false;
      } else {
        if (buffer.length > 0) {
          tokens.push({ type: "text", value: buffer });
        }
        buffer = "";
        inMath = true;
      }
      continue;
    }
    buffer += char;
  }

  if (inMath) {
    const literal = `$${buffer}`;
    const last = tokens[tokens.length - 1];
    if (last && last.type === "text") {
      last.value += literal;
    } else if (literal.length > 0) {
      tokens.push({ type: "text", value: literal });
    }
    return tokens;
  }

  if (buffer.length > 0) {
    tokens.push({ type: "text", value: buffer });
  }

  return tokens;
};

const countTypedSteps = (tokens) =>
  tokens.reduce(
    (sum, token) => sum + (token.type === "text" ? token.value.length : 1),
    0
  );

const renderTypedInlineKatex = (tokens, step) => {
  let remaining = step;
  const nodes = [];

  tokens.forEach((token, index) => {
    if (remaining <= 0) return;
    if (token.type === "text") {
      const count = Math.min(token.value.length, remaining);
      const text = token.value.slice(0, count);
      if (text.length > 0) {
        nodes.push(
          <Fragment key={`text-${index}`}>{text}</Fragment>
        );
      }
      remaining -= count;
    } else {
      nodes.push(<InlineMath key={`math-${index}`} math={token.value} />);
      remaining -= 1;
    }
  });

  return nodes;
};

export default function Contenu({ num, repertoire, plan, presentation, bg }) {
  const [typing, setTyping] = useState(false);
  const [typedStep, setTypedStep] = useState(0);

  const racine = `https://storage.googleapis.com/mathsapp/${repertoire}/tag${num}/`;
  const combinedText = useMemo(() => {
    const safePlan = Array.isArray(plan) ? plan : [];
    const safePresentation = Array.isArray(presentation) ? presentation : [];
    const numberedPlan = safePlan.map((elt, idx) => `${idx + 1}. ${elt}`);
    const lines = [...safePresentation, "", ...numberedPlan];
    return lines.join("\n");
  }, [plan, presentation]);

  const tokens = useMemo(() => parseInlineKatex(combinedText), [combinedText]);
  const totalSteps = useMemo(() => countTypedSteps(tokens), [tokens]);
  const typedNodes = useMemo(
    () => renderTypedInlineKatex(tokens, typedStep),
    [tokens, typedStep]
  );

  useEffect(() => {
    let timer;
    if (typing) {
      setTypedStep(0);
      if (totalSteps > 0) {
        let i = 0;
        timer = setInterval(() => {
          i += 1;
          setTypedStep(i);
          if (i >= totalSteps) {
            clearInterval(timer);
          }
        }, 15);
      }
    } else {
      setTypedStep(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [typing, totalSteps]);

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
          <div className="break-words w-full min-w-0 ">{typedNodes}</div>
        )}
      </div>

      <motion.div
        className="absolute inset-0"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={{
          hidden: { clipPath: "inset(0 0 100% 0)" },
          visible: { clipPath: "inset(0 0 0% 0)" },
        }}
        transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "clip-path" }}
      >
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
      </motion.div>

      <div
        className="absolute inset-0 w-full h-full z-10 cursor-pointer"
        onMouseEnter={() => setTyping(true)}
        onMouseLeave={() => setTyping(false)}
        onTouchStart={() => setTyping(true)}
      />
    </div>
  );
}
