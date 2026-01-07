import Image from "next/image";
import { LoginOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useEffect, useState } from "react";

const WORD = "MathsApp.fr";
const LETTERS = Array.from(WORD);
const BG_SOURCES = {
  mobile: "/bgP.jpg",
  medium: "/bgM.jpg",
  large: "/bgG.jpg",
};

function mulberry32(seed) {
  let t = seed;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function createPositions(count, maxX, maxY) {
  const rng = mulberry32(413219);
  return Array.from({ length: count }, () => {
    const x = (rng() * 2 - 1) * maxX;
    const y = (rng() * 2 - 1) * maxY;
    return { x: Math.round(x), y: Math.round(y) };
  });
}

function createOrder(count) {
  const rng = mulberry32(98231);
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const order = Array(count);
  indices.forEach((index, orderIndex) => {
    order[index] = orderIndex;
  });
  return order;
}

const RANDOM_POSITIONS = createPositions(LETTERS.length, 48, 48);
const RANDOM_ORDER = createOrder(LETTERS.length);

function pickBackground(width) {
  if (width >= 1200) {
    return BG_SOURCES.large;
  }
  if (width >= 768) {
    return BG_SOURCES.medium;
  }
  return BG_SOURCES.mobile;
}

function Index() {
  const [bgSrc, setBgSrc] = useState(BG_SOURCES.medium);

  useEffect(() => {
    const updateSource = () => {
      const nextSrc = pickBackground(window.innerWidth);
      setBgSrc((current) => (current === nextSrc ? current : nextSrc));
    };

    updateSource();
    window.addEventListener("resize", updateSource);
    return () => window.removeEventListener("resize", updateSource);
  }, []);

  return (
    <div className="page" style={{ "--count": LETTERS.length }}>
      <div className="stage ">
        <div className="word" aria-label={WORD}>
          {LETTERS.map((letter, index) => {
            const pos = RANDOM_POSITIONS[index];
            return (
              <span
                key={`${letter}-${index}`}
                className="letter"
                style={{
                  "--i": index,
                  "--order": RANDOM_ORDER[index],
                  "--rx": `${pos.x}vw`,
                  "--ry": `${pos.y}vh`,
                }}
                aria-hidden="true"
              >
                {letter}
              </span>
            );
          })}
        </div>
        <div className="hero" aria-hidden="true">
          <Image
            src={bgSrc}
            alt="Fond d'Ｄran"
            fill
            sizes="100vw"
            className="heroImage"
            priority
          />
        </div>
        <div className="ctaWrap">
          <Button className="ctaButton" icon={<LoginOutlined />}>
            Se connecter
          </Button>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          position: relative;
          background: #f6f4ef;
          color: #1a1a1a;
          overflow: hidden;
          --text-dark: #1a1a1a;
          --text-light: #cfd6d6;
          --duration: 0.7s;
          --stagger: 0.7s;
          --reveal-delay: 0.2s;
          --reveal-duration: 1.5s;
          --wash-delay: calc(var(--assemble-total) + var(--reveal-delay));
          --wash-duration: var(--reveal-duration);
          --raise-duration: 0.7s;
          --raise-stagger: 0.12s;
          --top-line: 100px;
          --top-shift: calc(var(--top-line) - 50vh);
          --word-size: clamp(2.2rem, 8.5vw, 7rem);
          --assemble-total: calc(
            (var(--count) - 1) * var(--stagger) + var(--duration)
          );
          --raise-delay: calc(
            var(--assemble-total) + var(--reveal-delay) + var(--reveal-duration) +
              0.2s
          );
          --raise-total: calc(
            var(--raise-delay) + (var(--count) - 1) * var(--raise-stagger) +
              var(--raise-duration)
          );
          --cta-delay: calc(var(--raise-total) + 0.2s);
          --cta-duration: 0.6s;
        }

        .stage {
          width: 100vw;
          height: 100vh;
          position: relative;
        }

        .word {
          position: absolute;
          inset: 0;
          font-family: "Courier New", Courier, monospace;
          font-weight: 700;
          font-size: var(--word-size);
          letter-spacing: 0.02em;
          line-height: 1;
          --spacing: 1.05ch;
          --half: calc((var(--count) - 1) * var(--spacing) / 2);
          z-index: 3;
        }

        .letter {
          position: absolute;
          left: 50%;
          top: 50%;
          font-weight: 700;
          color: var(--text-dark);
          transform: translate(var(--rx), var(--ry));
          animation-name: assemble, wash, raise;
          animation-duration: var(--duration), var(--wash-duration),
            var(--raise-duration);
          animation-timing-function: cubic-bezier(0.2, 0.7, 0.2, 1),
            cubic-bezier(0.2, 0.8, 0.2, 1),
            cubic-bezier(0.2, 0.6, 0.2, 1);
          animation-delay: calc(var(--i) * var(--stagger)), var(--wash-delay),
            calc(var(--raise-delay) + (var(--order) * var(--raise-stagger)));
          animation-fill-mode: both, both, forwards;
          will-change: transform, opacity;
        }

        .ctaWrap {
          position: absolute;
          left: 50%;
          top: calc(var(--top-line) + var(--word-size) + 16px);
          transform: translate(-50%, 20px);
          z-index: 2;
          opacity: 0;
          clip-path: inset(0 0 100% 0);
          animation: cta-in var(--cta-duration) cubic-bezier(0.2, 0.8, 0.2, 1)
            both;
          animation-delay: var(--cta-delay);
          will-change: transform, opacity, clip-path;
        }

        :global(.ctaButton) {
          padding: 0.85rem 2rem;
          border-radius: 999px;
          background: #111111;
          color: #f6f4ef;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
        }

        .hero {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 0;
          transform: translate(-50%, -50%);
          overflow: hidden;
          z-index: 1;
          animation: reveal var(--reveal-duration)
            cubic-bezier(0.2, 0.8, 0.2, 1) both;
          animation-delay: calc(var(--assemble-total) + var(--reveal-delay));
        }

        :global(.heroImage) {
          object-fit: cover;
        }

        @keyframes assemble {
          0% {
            transform: translate(var(--rx), var(--ry));
            opacity: 0.35;
          }
          100% {
            transform: translate(
              calc((var(--i) * var(--spacing)) - var(--half)),
              0
            );
            opacity: 1;
          }
        }

        @keyframes reveal {
          0% {
            width: 0;
            height: 0;
            opacity: 0;
          }
          100% {
            width: 100vw;
            height: 100vh;
            opacity: 1;
          }
        }

        @keyframes wash {
          0% {
            color: var(--text-dark);
          }
          100% {
            color: var(--text-light);
          }
        }

        @keyframes raise {
          0% {
            transform: translate(
              calc((var(--i) * var(--spacing)) - var(--half)),
              0
            );
            font-weight: 700;
            color: var(--text-light);
          }
          100% {
            transform: translate(
              calc((var(--i) * var(--spacing)) - var(--half)),
              var(--top-shift)
            );
            font-weight: 500;
            color: var(--text-dark);
          }
        }

        @keyframes cta-in {
          0% {
            transform: translate(-50%, 20px);
            opacity: 0;
            clip-path: inset(0 0 100% 0);
          }
          100% {
            transform: translate(-50%, 0);
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .letter {
            animation: none;
            transform: translate(
              calc((var(--i) * var(--spacing)) - var(--half)),
              var(--top-shift)
            );
            opacity: 1;
            font-weight: 500;
            color: var(--text-dark);
          }

          .ctaWrap {
            animation: none;
            transform: translate(-50%, 0);
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }

          .hero {
            animation: none;
            width: 100vw;
            height: 100vh;
            opacity: 1;
          }
        }

        @media (min-width: 768px) {
          .page {
            --top-line: 80px;
          }
        }

        @media (min-width: 1200px) {
          .page {
            --top-line: 40px;
          }
        }

        @media (min-width: 2000px) {
          .page {
            --top-line: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default Index;
