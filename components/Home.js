import React, { useState, useEffect } from "react";
import { Layout, theme } from "antd";
const { Content } = Layout;
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Card from "./Card";
import { useDispatch, useSelector } from "react-redux";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import { setCardsMaths } from "../reducers/cardsMathsSlice";

const NODE_ENV = process.env.NODE_ENV;
const URL_BACK = process.env.NEXT_PUBLIC_URL_BACK;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";

const App = ({repertoire}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
 

  const dispatch = useDispatch();
  const data = useSelector((state) => state.cardsMaths.data);
  const cardsFiltre = Array.isArray(data?.result) ? data.result : [];
  const cards = cardsFiltre.filter((obj) => obj.repertoire === repertoire);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resetSignals, setResetSignals] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showAccueil, setShowAccueil] = useState(false);

  useEffect(() => {
    setResetSignals((prev) => {
      const next = cards.map((_, idx) => prev[idx] ?? 0);
      if (
        next.length === prev.length &&
        next.every((val, idx) => val === prev[idx])
      ) {
        return prev;
      }
      return next;
    });
  }, [cards]);

  useEffect(() => {
    if (!Array.isArray(data) || data.length !== 0) {
      return; // le store contient deja autre chose, on ne refetch pas
    }

    let cancelled = false;

    const fetchCards = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch(`${urlFetch}/cards`);
        const payload = await response.json();
        if (cancelled) return;

        if (response.ok) {
          dispatch(setCardsMaths(payload));
          console.log("payload : ", payload);
        } else {
          setErrorMessage(
            payload?.error || "Erreur lors du chargement des cartes."
          );
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage("Erreur serveur.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCards();
    return () => {
      cancelled = true;
    };
  }, [data, dispatch, urlFetch]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateAccueilVisibility = () => {
      setShowAccueil(window.innerWidth >= 810);
    };

    updateAccueilVisibility();
    window.addEventListener("resize", updateAccueilVisibility);

    return () => {
      window.removeEventListener("resize", updateAccueilVisibility);
    };
  }, []);

  const handleExternalTabChange = (index) => {
    setResetSignals((prev) => {
      if (!prev.length) return prev;
      return prev.map((value, idx) => (idx === index ? value : value + 1));
    });
  };

  const getCardKey = (card, idx) => card._id || card.num || idx;
  const expandedIndex = cards.findIndex(
    (card, idx) => getCardKey(card, idx) === expandedId
  );
  const expandedCard = expandedIndex >= 0 ? cards[expandedIndex] : null;
  return (
    <Layout>
      <Content>
        <LayoutGroup>
          <div
            style={{
              background: colorBgContainer,
              minHeight: 20,
              paddingTop: 10,
              borderRadius: borderRadiusLG,
              marginTop: 0,
            }}
            className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-6 items-start "
          >
            {loading && (
              <div className="col-span-full flex flex-col items-center py-10">
                <ClimbingBoxLoader color="#6C6C6C" size={12} />
                <p className="mt-4 text-sm text-gray-500">
                  Chargement des cartes...
                </p>
              </div>
            )}

            {!loading && errorMessage && (
              <p className="col-span-full text-red-500 text-sm">
                {errorMessage}
              </p>
            )}
            {!loading && cards.length > 0 && showAccueil && (
              <Accueil titre={cards[0]?.titre} />
            )}
            {!loading &&
              !errorMessage &&
              cards.slice(0, 1).map((card, idx) => {
                const key = getCardKey(card, idx);
                const isExpanded = expandedId === key;

                return (
                  <motion.div
                    layout
                    layoutId={`card-${key}`}
                    key={key}
                    onClick={() => setExpandedId(isExpanded ? null : key)}
                    className="cursor-pointer m-5"
                    style={{
                      zIndex: isExpanded ? 20 : 1,
                      pointerEvents: isExpanded ? "none" : "auto",
                    }}
                    animate={{
                      scale: isExpanded ? 1 : 0.98,
                      opacity: isExpanded ? 0 : 1,
                      boxShadow: isExpanded
                        ? "0 18px 50px rgba(0,0,0,0.18)"
                        : "0 8px 25px rgba(0,0,0,0.08)",
                    }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    whileHover={{scale:1.005}}
                  >
                    <Card
                      {...card}
                      isExpanded={isExpanded}
                      onExpand={() => setExpandedId(key)}
                      resetSignal={resetSignals[idx]}
                      onTabChangeExternal={() => handleExternalTabChange(idx)}
                    />
                  </motion.div>
                );
              })}

            {!loading && !errorMessage && !cards.length && (
              <p className="col-span-full text-gray-500 text-sm">
                Aucune carte a afficher.
              </p>
            )}
          </div>
          <div
            style={{
              background: colorBgContainer,
              minHeight: 20,
              padding: 15,
              borderRadius: borderRadiusLG,
              marginTop: 0,
            }}
            className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-6 items-start"
          >
            {!loading &&
              !errorMessage &&
              cards.slice(1).map((card, idx) => {
                const key = getCardKey(card, idx);
                const isExpanded = expandedId === key;
                const wobble = (idx % 3) - 1;
                const tilt = idx % 2 === 0 ? -1.5 : 1.5;

                return (
                  <motion.div
                    layout
                    layoutId={`card-${key}`}
                    key={key}
                    onClick={() => setExpandedId(isExpanded ? null : key)}
                    className="cursor-pointer m-5 "
                    style={{
                      zIndex: isExpanded ? 20 : 1,
                      pointerEvents: isExpanded ? "none" : "auto",
                    }}
                    animate={{
                      scale: isExpanded ? 1 : 0.98,
                      rotate: isExpanded ? 0 : tilt,
                      y: isExpanded ? 0 : wobble * 12,
                      opacity: isExpanded ? 0 : 1,
                      boxShadow: isExpanded
                        ? "0 18px 50px rgba(0,0,0,0.18)"
                        : "0 8px 25px rgba(0,0,0,0.08)",
                    }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    whileHover={{scale:1.005}}
                  >
                    <Card
                      {...card}
                      isExpanded={isExpanded}
                      onExpand={() => setExpandedId(key)}
                      resetSignal={resetSignals[idx]}
                      onTabChangeExternal={() => handleExternalTabChange(idx)}
                    />
                  </motion.div>
                );
              })}
          </div>
          <AnimatePresence>
            {expandedCard && (
              <motion.div
                key="overlay"
                className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setExpandedId(null)}
                
              >
                <motion.div
                  layoutId={`card-${expandedId}`}
                  className="w-full max-w-5xl"
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Card
                    {...expandedCard}
                    isExpanded={true}
                    resetSignal={resetSignals[expandedIndex] ?? 0}
                    onTabChangeExternal={() =>
                      handleExternalTabChange(expandedIndex)
                    }
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </Content>
    </Layout>
  );
};

export default App;

function Accueil({ titre }) {
  return (
    <div className=" h-55 flex flex-col justify-center    m-7 overflow-hidden">
      <motion.p
        initial={{
          opacity: 0,
          x:-10,
          y: 30,
          clipPath: "inset(0 0 100% 0)",
          filter: "blur(12px)",
        }}
        animate={{
          opacity: 1,
          x:0,
          y: 0,
          clipPath: "inset(0 0 0% 0)",
          filter: "blur(0px)",
        }}
        transition={{
          duration: 1.9,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.05,
        }}
        className=" leading-tight text-2xl"
        whileHover={{x:5}}
      >
        Chapitre en cours :
      </motion.p>
      <motion.p
        initial={{
          opacity: 0,
          x:-10,
          y: 30,
          clipPath: "inset(0 0 100% 0)",
          filter: "blur(12px)",
        }}
        animate={{
          opacity: 1,
          x:0,
          y: 0,
          clipPath: "inset(0 0 0% 0)",
          filter: "blur(0px)",
        }}
        transition={{
          duration: 1.9,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.05,
        }}
        className="text-center leading-tight text-5xl"
        whileHover={{x:5}}
      >
        {titre}
      </motion.p>
    </div>
  );
}
