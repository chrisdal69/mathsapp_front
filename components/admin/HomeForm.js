import React, { useState, useEffect, useCallback } from "react";
import { Layout, theme, Button, message } from "antd";
const { Content } = Layout;
import Card from "./Card";
import { useDispatch, useSelector } from "react-redux";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import { setCardsMaths } from "../../reducers/cardsMathsSlice";

const NODE_ENV = process.env.NODE_ENV;
const URL_BACK = process.env.NEXT_PUBLIC_URL_BACK;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";
const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const dispatch = useDispatch();
  const data = useSelector((state) => state.cardsMaths.data);
  //console.log("data de la page HomeForm.js : ",data)
  const cardsFiltre = Array.isArray(data?.result) ? data.result : [];
  const cards = cardsFiltre.filter((obj) => obj.repertoire === "ciel1");

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resetSignals, setResetSignals] = useState([]);
  const [expandedKey, setExpandedKey] = useState(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${urlFetch}/cards/admin`, {
        credentials: "include",
      });
      const payload = await response.json();

      if (response.ok) {
        dispatch(setCardsMaths({ ...payload, __source: "admin" }));
      } else {
        setErrorMessage(payload?.error || "Erreur lors du chargement des cartes.");
      }
    } catch (err) {
      setErrorMessage("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, urlFetch]);

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
    if (data?.__source === "admin") {
      return; // payload admin deja present
    }

    fetchCards();
  }, [data?.__source, fetchCards]);

  const handleExternalTabChange = (index) => {
    setResetSignals((prev) => {
      if (!prev.length) return prev;
      return prev.map((value, idx) => (idx === index ? value : value + 1));
    });
  };

  const getCardKey = (card, idx) => card?._id || card?.id || card?.num || idx;

  const handleAddCard = async () => {
    const baseNum = Number(cards?.[0]?.num);
    const nextNum = Number.isFinite(baseNum) ? baseNum + 1 : cards.length + 1;
    const repertoire = (cards?.[0]?.repertoire || "ciel1").trim();

    if (!repertoire) {
      setErrorMessage("Répertoire introuvable pour la création.");
      return;
    }

    setCreating(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${urlFetch}/cards/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ num: nextNum, repertoire }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(payload?.error || "Impossible d'ajouter la carte.");
        return;
      }

      message.success("Carte ajoutée.");
      await fetchCards();
    } catch (err) {
      setErrorMessage("Erreur lors de l'ajout de la carte.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout>
      <Content>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 20,
            borderRadius: borderRadiusLG,
            marginTop: 0,
          }}
          className="flex flex-col gap-y-10 items-center p-1 md:p-4"
        >
          <div className="w-full flex justify-end">
            <Button
              type="primary"
              onClick={handleAddCard}
              loading={creating}
              disabled={loading}
            >
              Ajouter une carte
            </Button>
          </div>

          {loading && (
            <div className="flex flex-col items-center py-10">
              <ClimbingBoxLoader color="#6C6C6C" size={12} />
              <p className="mt-4 text-sm text-gray-500">
                Chargement des cartes...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
          {!loading &&
            !errorMessage &&
            cards.map((card, idx) => (
              <div className="w-full" key={card._id || card.num || idx}>
                <Card
                  {...card}
                  resetSignal={resetSignals[idx]}
                  onTabChangeExternal={() => handleExternalTabChange(idx)}
                  expanded={getCardKey(card, idx) === expandedKey}
                  onToggleExpand={(nextExpanded) => {
                    const key = getCardKey(card, idx);
                    setExpandedKey(nextExpanded ? key : null);
                  }}
                />
              </div>
            ))}

          {!loading && !errorMessage && !cards.length && (
            <p className="text-gray-500 text-sm">Aucune carte à afficher.</p>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default App;
