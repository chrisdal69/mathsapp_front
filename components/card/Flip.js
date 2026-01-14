import Image from "next/image";
import { motion } from "framer-motion";
import React, { useState } from "react";

function Flip({ q, racine }) {
  const [flipped, setFlipped] = useState(false);

  const questionText = String(q?.question ?? "").trim();
  const answerText = String(q?.reponse ?? "").trim();
  const questionImage = q?.imquestion ? `${racine}${q.imquestion}` : "";
  const answerImage = q?.imreponse ? `${racine}${q.imreponse}` : "";

  const renderFace = ({ text, imageSrc, imageAlt, isBack }) => {
    const hasText = text.length > 0;
    const hasImage = Boolean(imageSrc);
    const textOnly = hasText && !hasImage;

    const faceStyle = {
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      transformStyle: "preserve-3d",
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: isBack ? "rotateY(180deg)" : "rotateY(0deg)",
    };

    const contentStyle = {
      width: "100%",
      height: "100%",
      minHeight: textOnly ? 300 : undefined,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: textOnly ? "center" : "flex-start",
      gap: hasText && hasImage ? 4 : 0,
    };

    const textStyle = {
      margin: 0,
      textAlign: "center",
    };

    const imageWrapperStyle = {
      position: "relative",
      width: "100%",
      flex: "1 1 0",
      minHeight: hasText ? 0 : "100%",
      height: hasText ? "auto" : "100%",
    };

    return (
      <div style={faceStyle}>
        <div style={contentStyle}>
          {hasText && <p style={textStyle}>{text}</p>}
          {hasImage && (
            <div style={imageWrapperStyle}>
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 300px"
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "relative", marginBottom: 0, width: "100%" }}>
      <motion.div
        onClick={() => setFlipped(!flipped)}
        style={{
          width: "100%",
          height: 300,
          minHeight: 300,
          perspective: 1000,
        }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {renderFace({
            text: questionText,
            imageSrc: questionImage,
            imageAlt: "Image question",
            isBack: false,
          })}
          {renderFace({
            text: answerText,
            imageSrc: answerImage,
            imageAlt: "Image reponse",
            isBack: true,
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Flip;
