import React, { useEffect, useState } from "react";
import { Layout, theme } from "antd";
import Card from "../components/Card";
import { useDispatch, useSelector } from "react-redux";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import { setCardsMaths } from "../reducers/cardsMathsSlice";




const NODE_ENV = process.env.NODE_ENV;
const URL_BACK = process.env.NEXT_PUBLIC_URL_BACK;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";

const { Content } = Layout;

export default function PythonPage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const dispatch = useDispatch();
  const data = useSelector((state) => state.cardsMaths.data);
  const cardsFiltre = Array.isArray(data?.result) ? data.result : [];
  const cards = cardsFiltre.filter((obj) => obj.repertoire === "python");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!Array.isArray(data) || data.length !== 0) {
      return; // store déjà rempli → pas de refetch
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
          className="flex flex-col gap-y-20 items-center"
        >
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
                <Card {...card} />
              </div>
            ))}

          {!loading && !errorMessage && !cards.length && (
            <p className="text-gray-500 text-sm">Aucune carte à afficher.</p>
          )}
        </div>
      </Content>
    </Layout>
  );
}
