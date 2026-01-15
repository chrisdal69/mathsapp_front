import Image from "next/image";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

const parseInlineKatex = (input) => {
  const tokens = [];
  const text = String(input ?? "");
  let buffer = "";
  let inMath = false;
  let hasUnmatched = false;

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
    hasUnmatched = true;
    const literal = `$${buffer}`;
    const last = tokens[tokens.length - 1];
    if (last && last.type === "text") {
      last.value += literal;
    } else if (literal.length > 0) {
      tokens.push({ type: "text", value: literal });
    }
    return { parts: tokens, hasUnmatched };
  }

  if (buffer.length > 0) {
    tokens.push({ type: "text", value: buffer });
  }

  return { parts: tokens, hasUnmatched };
};

const renderInlineKatex = (input) => {
  const { parts, hasUnmatched } = parseInlineKatex(input);
  const nodes = parts.map((part, i) =>
    part.type === "text" ? (
      <React.Fragment key={`text-${i}`}>{part.value}</React.Fragment>
    ) : (
      <InlineMath key={`math-${i}`} math={part.value} />
    )
  );
  return { nodes, hasUnmatched };
};

function Flip({ q, racine, index }) {
  const [flipped, setFlipped] = useState(false);
  const imageWheelHandlersRef = useRef(new Map());
  const imageTouchHandlersRef = useRef(new Map());
  const pinchStateRef = useRef(new Map());
  const flipWheelRef = useRef(null);
  const [zoomScales, setZoomScales] = useState({});
  const [zoomOrigins, setZoomOrigins] = useState({});

  const questionText = String(q?.question ?? "").trim();
  const answerText = String(q?.reponse ?? "").trim();
  const questionImage = q?.imquestion ? `${racine}${q.imquestion}` : "";
  const answerImage = q?.imreponse ? `${racine}${q.imreponse}` : "";
  const labelSuffix = Number.isFinite(index) ? ` ${index}` : "";
  const labelText = flipped
    ? `R\u00e9ponse${labelSuffix}`
    : `Question${labelSuffix}`;
  const labelStyle = {
    margin: "0 0 8px",
    textAlign: "center",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#555",
    letterSpacing: "0.02em",
  };

  const clampPercent = (value) => Math.max(0, Math.min(100, value));

  const clampScale = (value) => Math.max(1, Math.min(3, value));

  const getTouchDistance = (t1, t2) =>
    Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

  const getTouchCenter = (t1, t2) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  const handleImageWheel = (event, key) => {
    if (!key) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    if (typeof event.stopPropagation === "function") {
      event.stopPropagation();
    }
    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }
    const target = event.currentTarget || event.target;
    const rect = target?.getBoundingClientRect?.();
    if (!rect) return;
    if (rect.width && rect.height) {
      const x = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
      const y = clampPercent(((event.clientY - rect.top) / rect.height) * 100);
      setZoomOrigins((prev) => ({ ...prev, [key]: `${x}% ${y}%` }));
    }

    const delta = event.deltaY < 0 ? 0.2 : -0.2;
    setZoomScales((prev) => {
      const currentScale = prev[key] ?? 1;
      const nextScale = clampScale(currentScale + delta);
      return { ...prev, [key]: nextScale };
    });
  };

  const handleImageTouchStart = (event, key) => {
    if (!key) return;
    const touches = event.touches;
    if (!touches || touches.length !== 2) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    if (typeof event.stopPropagation === "function") {
      event.stopPropagation();
    }
    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }
    const [t1, t2] = touches;
    const rect = event.currentTarget?.getBoundingClientRect?.();
    if (rect?.width && rect?.height) {
      const center = getTouchCenter(t1, t2);
      const x = clampPercent(((center.x - rect.left) / rect.width) * 100);
      const y = clampPercent(((center.y - rect.top) / rect.height) * 100);
      setZoomOrigins((prev) => ({ ...prev, [key]: `${x}% ${y}%` }));
    }
    const startDistance = getTouchDistance(t1, t2);
    if (!Number.isFinite(startDistance) || startDistance <= 0) return;
    pinchStateRef.current.set(key, {
      startDistance,
      startScale: zoomScales[key] ?? 1,
    });
  };

  const handleImageTouchMove = (event, key) => {
    if (!key) return;
    const touches = event.touches;
    if (!touches || touches.length !== 2) return;
    const state = pinchStateRef.current.get(key);
    if (!state) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    if (typeof event.stopPropagation === "function") {
      event.stopPropagation();
    }
    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }
    const [t1, t2] = touches;
    const rect = event.currentTarget?.getBoundingClientRect?.();
    if (rect?.width && rect?.height) {
      const center = getTouchCenter(t1, t2);
      const x = clampPercent(((center.x - rect.left) / rect.width) * 100);
      const y = clampPercent(((center.y - rect.top) / rect.height) * 100);
      setZoomOrigins((prev) => ({ ...prev, [key]: `${x}% ${y}%` }));
    }
    const distance = getTouchDistance(t1, t2);
    if (!Number.isFinite(distance) || state.startDistance <= 0) return;
    const nextScale = clampScale(state.startScale * (distance / state.startDistance));
    setZoomScales((prev) => ({ ...prev, [key]: nextScale }));
  };

  const handleImageTouchEnd = (event, key) => {
    if (!key) return;
    if (event.touches && event.touches.length >= 2) return;
    pinchStateRef.current.delete(key);
  };

  const setImageContainerRef = (key) => (node) => {
    const existing = imageWheelHandlersRef.current.get(key);
    if (existing?.node && existing?.handler) {
      existing.node.removeEventListener("wheel", existing.handler);
      imageWheelHandlersRef.current.delete(key);
    }
    const existingTouch = imageTouchHandlersRef.current.get(key);
    if (existingTouch?.node && existingTouch?.handlers) {
      const { start, move, end } = existingTouch.handlers;
      existingTouch.node.removeEventListener("touchstart", start);
      existingTouch.node.removeEventListener("touchmove", move);
      existingTouch.node.removeEventListener("touchend", end);
      existingTouch.node.removeEventListener("touchcancel", end);
      imageTouchHandlersRef.current.delete(key);
    }
    if (!node) return;
    const handler = (event) => handleImageWheel(event, key);
    node.addEventListener("wheel", handler, { passive: false });
    imageWheelHandlersRef.current.set(key, { node, handler });
    const touchStart = (event) => handleImageTouchStart(event, key);
    const touchMove = (event) => handleImageTouchMove(event, key);
    const touchEnd = (event) => handleImageTouchEnd(event, key);
    node.addEventListener("touchstart", touchStart, { passive: false });
    node.addEventListener("touchmove", touchMove, { passive: false });
    node.addEventListener("touchend", touchEnd, { passive: false });
    node.addEventListener("touchcancel", touchEnd, { passive: false });
    imageTouchHandlersRef.current.set(key, {
      node,
      handlers: { start: touchStart, move: touchMove, end: touchEnd },
    });
  };

  useEffect(
    () => () => {
      imageWheelHandlersRef.current.forEach(({ node, handler }) => {
        node.removeEventListener("wheel", handler);
      });
      imageWheelHandlersRef.current.clear();
      imageTouchHandlersRef.current.forEach(({ node, handlers }) => {
        if (!handlers) return;
        node.removeEventListener("touchstart", handlers.start);
        node.removeEventListener("touchmove", handlers.move);
        node.removeEventListener("touchend", handlers.end);
        node.removeEventListener("touchcancel", handlers.end);
      });
      imageTouchHandlersRef.current.clear();
      pinchStateRef.current.clear();
    },
    []
  );

  useEffect(() => {
    const node = flipWheelRef.current;
    if (!node) return undefined;
    const handler = (event) => {
      const target = event.target;
      if (!target?.closest?.("[data-zoom-wheel='true']")) return;
      if (event.cancelable) {
        event.preventDefault();
      }
      if (typeof event.stopPropagation === "function") {
        event.stopPropagation();
      }
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
    };
    node.addEventListener("wheel", handler, { passive: false });
    return () => {
      node.removeEventListener("wheel", handler);
    };
  }, []);

  const renderFace = ({ text, imageSrc, imageAlt, isBack, zoomKey }) => {
    const hasText = text.length > 0;
    const hasImage = Boolean(imageSrc);
    const textOnly = hasText && !hasImage;
    const { nodes } = hasText ? renderInlineKatex(text) : { nodes: null };
    const scale = zoomScales[zoomKey] ?? 1;
    const isZoomed = scale > 1;

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
      backgroundColor: "rgba(255, 255, 255, 0.75)",
      borderRadius: 15,
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
      whiteSpace: "pre-line",
      fontSize: "1.05rem",
    };

    const imageWrapperStyle = {
      position: "relative",
      width: "100%",
      flex: "1 1 0",
      minHeight: hasText ? 0 : "100%",
      height: hasText ? "auto" : "100%",
      overflow: "hidden",
      cursor: isZoomed ? "zoom-out" : "zoom-in",
      overscrollBehavior: "contain",
      touchAction: "none",
    };

    return (
      <div style={faceStyle}>
        <div style={contentStyle}>
          {hasText && <p style={textStyle}>{nodes}</p>}
          {hasImage && (
            <div
              style={imageWrapperStyle}
              ref={setImageContainerRef(zoomKey)}
              data-zoom-wheel="true"
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 300px"
                style={{
                  objectFit: "contain",
                  transition: "transform 200ms ease",
                  transform: isZoomed ? `scale(${scale})` : "scale(1)",
                  transformOrigin: zoomOrigins[zoomKey] || "50% 50%",
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <p style={labelStyle}>{labelText}</p>
      <div style={{ position: "relative", marginBottom: 0, width: "100%" }}>
        <motion.div
          ref={flipWheelRef}
          onClick={() => setFlipped(!flipped)}
          style={{
            width: "100%",
            height: 300,
            minHeight: 300,
            perspective: 1000,
            borderRadius: 15,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
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
            zoomKey: "question",
          })}
          {renderFace({
            text: answerText,
            imageSrc: answerImage,
            imageAlt: "Image reponse",
            isBack: true,
            zoomKey: "answer",
          })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Flip;
