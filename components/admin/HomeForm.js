import React, { useState, useEffect } from "react";
import { Layout, theme } from "antd";
const { Content } = Layout;
import Card from "./Card";
import { useDispatch, useSelector } from "react-redux";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import { setCardsMaths } from "../../reducers/cardsMathsSlice";

const NODE_ENV = process.env.NODE_ENV;
const URL_BACK = process.env.NEXT_PUBLIC_URL_BACK;
const urlFetch = NODE_ENV === "production" ? URL_BACK : "http://localhost:3000";

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const dispatch = useDispatch();
  const data = useSelector((state) => state.cardsMaths.data);
  const cardsFiltre = Array.isArray(data?.result) ? data.result : [];
  const cards = cardsFiltre.filter((obj) => obj.repertoire === "ciel1");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resetSignals, setResetSignals] = useState([]);

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
      return; // le store contient déjà autre chose, on ne refetch pas
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

  const handleExternalTabChange = (index) => {
    setResetSignals((prev) => {
      if (!prev.length) return prev;
      return prev.map((value, idx) => (idx === index ? value : value + 1));
    });
  };

  return (
    <Layout>
      <Content>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 20,
            padding: 15,
            borderRadius: borderRadiusLG,
            marginTop: 0,
          }}
          className="flex flex-col gap-y-10 items-center"
        >
          <p>Home admin</p>

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
