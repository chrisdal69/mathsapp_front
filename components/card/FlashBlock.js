import React, { useRef, useState } from "react";
import { Button, Card, Carousel } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Flip from "./Flip";

export default function FlashBlock({
  num,
  repertoire,
  flash,
  bg,
  isExpanded,
}) {
  const carouselRef = useRef(null);

  const [current, setCurrent] = useState(0);

  const bgRoot = `https://storage.googleapis.com/${
    process.env.NEXT_PUBLIC_BUCKET_NAME || "mathsapp"
  }/${repertoire}/tag${num}/`;
  const racine = `https://storage.googleapis.com/${
    process.env.NEXT_PUBLIC_BUCKET_NAME || "mathsapp"
  }/${repertoire}/tag${num}/imagesFlash/`;

  const toBlurFile = (filename) => {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot === -1) return `${filename}Blur`;
    return `${filename.slice(0, lastDot)}Blur${filename.slice(lastDot)}`;
  };

  const blurBg = bg ? toBlurFile(bg) : "";
  const showBackground = Boolean(isExpanded && bg);

  const handlePrev = () => {
    setCurrent((c) => Math.max(0, c - 1));
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    setCurrent((c) => Math.min(flash.length - 1, c + 1));
    carouselRef.current?.next();
  };

  // Echelle de progression dynamique (points rapproches)
  const DOT = 10; // diametre du point (px)
  const GAP = 20; // espace entre points (px)
  const trackWidth = flash.length * DOT + (flash.length - 1) * GAP;

  return (
    <div className="relative w-full">
      {showBackground && (
        <>
          <div className="absolute inset-0 z-0">
            <Image
              src={`${bgRoot}${bg}`}
              alt=""
              fill
              placeholder="blur"
              blurDataURL={`${bgRoot}${blurBg}`}
              sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover object-center"
            />
          </div>
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: "rgba(255,255,255,0.8)" }}
          />
        </>
      )}
      <div className="relative z-20 p-4">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            position: "relative",
          }}
        >
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
                {flash.map((q, idx) => {
                  const isCurrent = idx === current;
                  const size = isCurrent ? DOT + 4 : DOT;
                  const dotColor = isCurrent ? "#595959" : "#d9d9d9";
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
                        backgroundColor: dotColor,
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
            {current < flash.length - 1 && (
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
            {flash.map((q) => {
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
                      backgroundColor: "rgba(100,100,100,0.2)",
                    }}
                  >
                    <Flip q={q} racine={racine} />
                  </Card>
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>
    </div>
  );
}
