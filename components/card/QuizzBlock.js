import { useRef, useState } from "react";
import { Radio, Button, Card, Carousel } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function Quizz({ questions }) {
  const carouselRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hovered, setHovered] = useState(null);

  // Échelle de progression dynamique (points rapprochés)
  const DOT = 10; // diamètre du point (px)
  const GAP = 20; // espace entre points (px)
  const trackWidth = questions.length * DOT + (questions.length - 1) * GAP;

  const handleSelect = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Échelle de progression */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          {current > 0 && (
            <Button
              type="default"
              shape="circle"
              onClick={() => carouselRef.current?.prev()}
              style={{
                position: "relative",
                top: "3px",
                marginRight: "20px",
                zIndex: 2,
                background: "#fff",
                transform: "translateY(-50%)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
              aria-label="Précédent"
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
              {questions.map((q, idx) => {
                const answered = Boolean(answers[q.id]);
                const isCurrent = idx === current;
                const bg = isCurrent
                  ? "#595959"
                  : answered
                  ? "#52c41a"
                  : "#d9d9d9";
                return (
                  <div
                    key={q.id}
                    role="button"
                    onClick={() => carouselRef.current?.goTo(idx)}
                    style={{
                      width: DOT,
                      height: DOT,
                      borderRadius: "50%",
                      backgroundColor: bg,
                      border: "1px solid #bfbfbf",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                    aria-label={`Aller à la question ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
          {current < questions.length - 1 && (
            <Button
              type="default"
              shape="circle"
              onClick={() => carouselRef.current?.next()}
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
          afterChange={(i) => setCurrent(i)}
          className="max-w-xs sm:max-w-2xl"
        >
          {questions.map((q) => (
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
                }}
              >
                <div style={{ position: "relative", marginBottom: 10 }}>
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
                        src={q.image}
                        alt=""
                        width="400"
                        height="400"
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
                    color: answers[q.id]
                      ? answers[q.id] === q.options[q.correct]
                        ? "#52c41a"
                        : "#ff4d4f"
                      : undefined,
                  }}
                >
                  {q.question}
                </p>

                <Radio.Group
                  value={answers[q.id] ?? null}
                  onChange={(e) => handleSelect(q.id, e.target.value)}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 12,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {q.options.map((opt, i) => {
                    const sel = answers[q.id] === opt;
                    const isOk = sel && answers[q.id] === q.options[q.correct];
                    const isErr = sel && answers[q.id] !== q.options[q.correct];
                    const borderColor = isOk
                      ? "#52c41a"
                      : isErr
                      ? "#ff4d4f"
                      : "transparent";
                    const bg = isOk
                      ? "rgba(82,196,26,0.12)"
                      : isErr
                      ? "rgba(255,77,79,0.12)"
                      : "transparent";
                    const textColor = isOk
                      ? "#52c41a"
                      : isErr
                      ? "#ff4d4f"
                      : undefined;
                    return (
                      <div
                        key={opt}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 8,
                          border: `1px solid ${borderColor}`,
                          backgroundColor: bg,
                        }}
                      >
                        <Radio value={opt} style={{ color: textColor }}>
                          {opt}
                        </Radio>
                      </div>
                    );
                  })}
                </Radio.Group>
              </Card>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
