import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { Radio, Button, Card, Carousel, message } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

const NODE_ENV = process.env.NODE_ENV;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";

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

export default function Quizz({
  num,
  repertoire,
  quizz,
  evalQuizz,
  resultatQuizz,
  _id,
  id,
}) {
  const carouselRef = useRef(null);
  const preloadedImagesRef = useRef(new Set());
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hovered, setHovered] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [scoreMessage, setScoreMessage] = useState("");
  const [historyMessage, setHistoryMessage] = useState("");
  const [hasHistory, setHasHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const racine = `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_BUCKET_NAME || "mathsapp"}/${repertoire}/tag${num}/imagesQuizz/`;

  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cardId = _id || id;

  const handlePrev = () => {
    setCurrent((c) => Math.max(0, c - 1));
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    setCurrent((c) => Math.min(quizz.length - 1, c + 1));
    carouselRef.current?.next();
  };

  // Echelle de progression dynamique (points rapproches)
  const DOT = 10; // diametre du point (px)
  const GAP = 20; // espace entre points (px)
  const trackWidth = quizz.length * DOT + (quizz.length - 1) * GAP;

  const reponsesArray = quizz.map((q) => answers[q.id]);
  const allAnswered = reponsesArray.every((r) => r !== undefined);

  const handleSelect = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!Array.isArray(quizz)) return;
    const sources = quizz
      .map((q) => q?.image)
      .filter(Boolean)
      .map((image) => `${racine}${image}`);

    sources.forEach((src) => {
      if (preloadedImagesRef.current.has(src)) return;
      const img = new window.Image();
      img.src = src;
      preloadedImagesRef.current.add(src);
    });
  }, [quizz, racine]);

  useEffect(() => {
    if (evalQuizz !== "oui" || !cardId || !isAuthenticated) return;
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const res = await fetch(
          `${urlFetch}/quizzs/historique?cardId=${cardId}`,
          { credentials: "include" }
        );
        const payload = await res.json();
        if (cancelled) return;
        if (res.ok && payload?.alreadyDone) {
          const dateStr = payload.date
            ? new Date(payload.date).toLocaleString("fr-FR", {
                dateStyle: "short",
                timeStyle: "short",
              })
            : "";
          setHistoryMessage(
            dateStr ? `Quizz déjà soumis le ${dateStr}.` : "Quizz déjà soumis."
          );
          if (
            resultatQuizz &&
            payload.correctCount !== undefined &&
            payload.totalQuestions !== undefined
          ) {
            setScoreMessage(
              `${payload.correctCount} reponses correctes sur ${payload.totalQuestions}.`
            );
          }
          setHasHistory(true);
        }
      } catch (error) {
        // en cas d'erreur, on laisse l'utilisateur tenter
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [evalQuizz, cardId, isAuthenticated, resultatQuizz]);

  const handleSubmit = async () => {
    if (!cardId) {
      messageApi.error("Identifiant de carte manquant.");
      return;
    }

    const reponses = quizz.map((q) => answers[q.id]);
    const missing = reponses.findIndex((r) => r === undefined);
    if (missing !== -1) {
      messageApi.warning(
        "Merci de repondre a toutes les questions avant d'envoyer."
      );
      setCurrent(missing);
      carouselRef.current?.goTo(missing);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${urlFetch}/quizzs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cardId, reponses }),
      });
      const payload = await res.json();
      if (!res.ok) {
        messageApi.error(
          payload?.message || "Enregistrement des reponses impossible."
        );
        return;
      }
      messageApi.success("Reponses enregistrees.");
      if (payload?.alreadyDone && payload.correctCount !== undefined) {
        setScoreMessage(
          `Quizz deja traite : ${payload.correctCount} reponses correctes sur ${payload.totalQuestions}.`
        );
      } else if (
        resultatQuizz &&
        payload?.correctCount !== undefined &&
        payload?.totalQuestions !== undefined
      ) {
        setScoreMessage(
          `${payload.correctCount} reponses correctes sur ${payload.totalQuestions}.`
        );
      } else {
        setScoreMessage("");
      }
      if (payload?.date) {
        const dateStr = new Date(payload.date).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        });
        setHistoryMessage(`Quizz soumis le ${dateStr}.`);
      } else {
        setHistoryMessage("Quizz soumis.");
      }
      setHasHistory(true);
    } catch (error) {
      messageApi.error("Erreur lors de l'envoi des reponses.");
    } finally {
      setSubmitting(false);
    }
  };

  const canAccess =
    evalQuizz === "non" || (evalQuizz === "oui" && isAuthenticated);
  const showOverlay = submitting || historyLoading;

  return (
    <div>
      {contextHolder}
      {evalQuizz === "attente" ? (
        <p>Quizz en attente de validation.</p>
      ) : canAccess ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            position: "relative",
          }}
        >
          {showOverlay && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <ClimbingBoxLoader color="#6C6C6C" size={12} />
            </div>
          )}
          {/* Echelle de progression */}

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginBottom: 4,
              marginTop: 14,
            }}
          >
            {current > 0 && (
              <Button
                type="default"
                shape="circle"
                onClick={handlePrev}
                style={{
                  position: "relative",
                  top: "3px",
                  marginRight: "20px",
                  zIndex: 2,
                  background: "#fff",
                  transform: "translateY(-50%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                aria-label="Precedent"
              >
                <ChevronLeft size={18} />
              </Button>
            )}
            <div
              style={{
                position: "relative",
                width: trackWidth,
                height: 12,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  height: 1,
                  background: "#e5e5e5",
                  transform: "translateY(-50%)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {quizz.map((q, idx) => {
                  const answered = answers[q.id] !== undefined;
                  const isCurrent = idx === current;
                  const size = answered ? DOT + 4 : DOT;
                  const bg = isCurrent
                    ? "#595959"
                    : answered
                    ? "#1890ff"
                    : "#d9d9d9";
                  return (
                    <div
                      key={q.id}
                      role="button"
                      onClick={() => {
                        setCurrent(idx);
                        carouselRef.current?.goTo(idx);
                      }}
                      style={{
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        backgroundColor: bg,
                        border: "1px solid #bfbfbf",
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                      aria-label={`Aller a la question ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>
            {current < quizz.length - 1 && (
              <Button
                type="default"
                shape="circle"
                onClick={handleNext}
                style={{
                  position: "relative",
                  top: "3px",
                  marginLeft: "20px",
                  zIndex: 2,
                  background: "#fff",
                  transform: "translateY(-50%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                aria-label="Suivant"
              >
                <ChevronRight size={18} />
              </Button>
            )}
          </div>

          {/* Carrousel de questions */}
          <Carousel
            ref={carouselRef}
            dots
            swipe
            draggable
            infinite={false}
            beforeChange={(_, to) => setCurrent(to)}
            afterChange={(i) => setCurrent(i)}
            adaptiveHeight
            className="max-w-xs sm:max-w-2xl"
          >
            {quizz.map((q) => {
              const { nodes: questionJsx, hasUnmatched: questionHasError } =
                renderInlineKatex(q.question);
              return (
                <div
                  key={q.id}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Card
                    style={{
                      margin: "4px auto",
                      width: "100%",
                      maxWidth: "100%",
                      textAlign: "center",
                      padding: "0px",
                    }}
                  >
                    <div style={{ position: "relative", marginBottom: 0 }}>
                      {q.image && (
                        <div
                          style={{
                            display: "inline-block",
                            borderRadius: 8,
                            overflow: "hidden",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                          }}
                        >
                          <Image
                            src={racine + q.image}
                            alt=""
                            width={300}
                            height={300}
                            loading="eager"
                            style={{
                              display: "block",
                              margin: 0,
                              transition: "transform 200ms ease",
                              transform:
                                hovered === q.id ? "scale(1.04)" : "scale(1)",
                            }}
                            onMouseEnter={() => setHovered(q.id)}
                            onMouseLeave={() => setHovered(null)}
                          />
                        </div>
                      )}
                    </div>

                    <p
                      style={{
                        marginBottom: 10,

                        color:
                          evalQuizz === "non" &&
                          Number.isInteger(q.correct) &&
                          answers[q.id] !== undefined
                            ? answers[q.id] === q.correct
                              ? "#52c41a"
                              : "#ff4d4f"
                            : undefined,
                      }}
                    >
                      {questionJsx}
                      {questionHasError && (
                        <span
                          style={{
                            color: "#ff4d4f",
                            marginLeft: 6,
                            fontSize: 12,
                          }}
                        >
                          ($ non ferme)
                        </span>
                      )}
                    </p>

                    <Radio.Group
                      value={answers[q.id] ?? null}
                      onChange={(e) => handleSelect(q.id, e.target.value)}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 2,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {q.options.map((opt, i) => {
                        const sel = answers[q.id] === i;
                        const showFeedback =
                          evalQuizz === "non" && Number.isInteger(q.correct);
                        const isOk =
                          showFeedback && sel && answers[q.id] === q.correct;
                        const isErr =
                          showFeedback && sel && answers[q.id] !== q.correct;
                        const borderColor = isOk
                          ? "#52c41a"
                          : isErr
                          ? "#ff4d4f"
                          : "transparent";
                        const bg = isOk
                          ? "rgba(82,196,26,0.12)"
                          : isErr
                          ? "rgba(255,77,79,0.12)"
                          : sel
                          ? "rgba(0,0,0,0.05)"
                          : "transparent";
                        const textColor = isOk
                          ? "#52c41a"
                          : isErr
                          ? "#ff4d4f"
                          : undefined;
                        const { nodes: optJsx, hasUnmatched: optHasError } =
                          renderInlineKatex(opt);

                        return (
                          <div
                            key={i}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 8,
                              border: `1px solid ${borderColor}`,
                              backgroundColor: bg,
                            }}
                          >
                            <Radio value={i} style={{ color: textColor }}>
                              {optJsx}
                              {optHasError && (
                                <span
                                  style={{
                                    color: "#ff4d4f",
                                    marginLeft: 6,
                                    fontSize: 12,
                                  }}
                                >
                                  ($ non ferme)
                                </span>
                              )}
                            </Radio>
                          </div>
                        );
                      })}
                    </Radio.Group>
                  </Card>
                </div>
              );
            })}
          </Carousel>
          {evalQuizz === "oui" && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              {!hasHistory && !historyLoading && (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={submitting || !allAnswered}
                >
                  Envoyer mes reponses
                </Button>
              )}
              {historyMessage && (
                <p style={{ marginTop: 8 }}>{historyMessage}</p>
              )}
              {scoreMessage && <p style={{ marginTop: 4 }}>{scoreMessage}</p>}
            </div>
          )}
        </div>
      ) : (
        <p>Il faut etre connecte pour acceder au quizz.</p>
      )}
    </div>
  );
}
