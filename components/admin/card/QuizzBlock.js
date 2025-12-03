import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Carousel,
  Input,
  message,
  Popover,
  Radio,
  Select,
  Upload,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import { setCardsMaths } from "../../../reducers/cardsMathsSlice";

const NODE_ENV = process.env.NODE_ENV;
const urlFetch = NODE_ENV === "production" ? "" : "http://localhost:3000";
const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png"];

export default function Quizz({
  num,
  repertoire,
  quizz,
  evalQuizz,
  resultatQuizz,
  _id,
  id,
}) {
  const dispatch = useDispatch();
  const cardsData = useSelector((state) => state.cardsMaths.data);
  const carouselRef = useRef(null);

  const [current, setCurrent] = useState(0);
  const [quizzList, setQuizzList] = useState(Array.isArray(quizz) ? quizz : []);
  const [localEvalQuizz, setLocalEvalQuizz] = useState(evalQuizz || "non");
  const [localResultatQuizz, setLocalResultatQuizz] = useState(!!resultatQuizz);

  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [deleteQuestionOpen, setDeleteQuestionOpen] = useState(false);
  const [questionInsertPos, setQuestionInsertPos] = useState("end");

  const [editQuestion, setEditQuestion] = useState({ id: null, value: "" });
  const [editOption, setEditOption] = useState({
    qid: null,
    index: null,
    value: "",
  });
  const [optionInsert, setOptionInsert] = useState({
    qid: null,
    position: "end",
    value: "",
  });
  const [actionKey, setActionKey] = useState("");
  const [uploadingImageFor, setUploadingImageFor] = useState("");

  const cardId = _id || id;
  const racine = useMemo(
    () =>
      `https://storage.googleapis.com/mathsapp/${repertoire}/tag${num}/imagesQuizz/`,
    [repertoire, num]
  );

  useEffect(() => {
    setQuizzList(Array.isArray(quizz) ? quizz : []);
  }, [quizz]);

  useEffect(() => {
    setLocalEvalQuizz(evalQuizz || "non");
  }, [evalQuizz]);

  useEffect(() => {
    setLocalResultatQuizz(!!resultatQuizz);
  }, [resultatQuizz]);

const DOT = 10;
const GAP = 20;
const trackWidth =
  (quizzList.length || 1) * DOT + Math.max(0, quizzList.length - 1) * GAP;

  const reindexQuizz = (list) =>
    (Array.isArray(list) ? list : []).map((q, idx) => ({
      ...q,
      id: `q${idx + 1}`,
      options: Array.isArray(q.options) ? q.options : [],
      image: q.image || "",
    }));

  const resolveInsertIndex = (list, pos) => {
    const length = Array.isArray(list) ? list.length : 0;
    if (pos === "start") return 0;
    if (pos === "end" || pos === undefined || pos === null) return length;
    const numeric = Number(pos);
    if (!Number.isNaN(numeric)) {
      return Math.max(0, Math.min(length, numeric + 1));
    }
    return length;
  };

  const getActionKey = (mode, idPart, extra) =>
    [mode, idPart, extra].filter(Boolean).join("-");

  const isAction = (key) => actionKey === key;

  const syncCardsStore = (updatedCard, fallbackQuizz) => {
    if (!cardsData || !Array.isArray(cardsData.result)) return;
    const targetId = updatedCard?._id || updatedCard?.id || cardId;
    const targetNum =
      typeof updatedCard?.num !== "undefined" ? updatedCard.num : num;
    const targetRepertoire = updatedCard?.repertoire || repertoire;
    const patch =
      updatedCard || {
        quizz: fallbackQuizz,
        evalQuizz: localEvalQuizz,
        resultatQuizz: localResultatQuizz,
      };

    const nextResult = cardsData.result.map((card) => {
      const matchById =
        targetId && (card._id === targetId || card.id === targetId);
      const matchByComposite =
        !matchById &&
        targetId &&
        typeof targetNum !== "undefined" &&
        typeof card.num !== "undefined" &&
        card.num === targetNum &&
        targetRepertoire &&
        card.repertoire === targetRepertoire;
      return matchById || matchByComposite ? { ...card, ...patch } : card;
    });

    dispatch(setCardsMaths({ ...cardsData, result: nextResult }));
  };

  const persistQuizz = async (
    nextQuizz,
    { evalValue, resultValue, successMessage } = {},
    loadingKey = ""
  ) => {
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return false;
    }

    const payload = {
      quizz: reindexQuizz(nextQuizz ?? quizzList),
      evalQuizz: evalValue ?? localEvalQuizz,
      resultatQuizz:
        typeof resultValue === "boolean" ? resultValue : localResultatQuizz,
    };

    setActionKey(loadingKey);
    try {
      const response = await fetch(`${urlFetch}/quizzs/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (response.status === 401 || response.status === 403) {
        throw new Error("Session expirée ou droits insuffisants. Merci de vous reconnecter.");
      }
      let data = null;
      try {
        data = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible d'enregistrer les modifications."
        );
      }
      const updatedCard = data?.result;
      if (updatedCard?.quizz) {
        setQuizzList(Array.isArray(updatedCard.quizz) ? updatedCard.quizz : []);
      } else {
        setQuizzList(payload.quizz);
      }
      if (updatedCard?.evalQuizz) {
        setLocalEvalQuizz(updatedCard.evalQuizz);
      } else if (evalValue) {
        setLocalEvalQuizz(evalValue);
      }
      if (typeof updatedCard?.resultatQuizz !== "undefined") {
        setLocalResultatQuizz(!!updatedCard.resultatQuizz);
      } else if (typeof resultValue === "boolean") {
        setLocalResultatQuizz(resultValue);
      }
      syncCardsStore(updatedCard, payload.quizz);
      if (successMessage) {
        message.success(successMessage);
      }
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du quizz :", error);
      message.error(error.message || "Erreur lors de la sauvegarde.");
      return false;
    } finally {
      setActionKey("");
    }
  };

  const handlePrev = () => {
    setCurrent((c) => Math.max(0, c - 1));
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    setCurrent((c) => Math.min(quizzList.length - 1, c + 1));
    carouselRef.current?.next();
  };

  const handleAddQuestion = async () => {
    const insertIndex = resolveInsertIndex(quizzList, questionInsertPos);
    const blank = {
      id: "",
      question: "",
      image: "",
      options: [],
      correct: null,
    };
    const next = [...quizzList];
    next.splice(insertIndex, 0, blank);
    const ok = await persistQuizz(
      next,
      { successMessage: "Question ajoutee." },
      "add-question"
    );
    if (ok) {
      setAddQuestionOpen(false);
      setQuestionInsertPos("end");
      setCurrent(insertIndex);
      carouselRef.current?.goTo(insertIndex);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!quizzList.length) {
      setDeleteQuestionOpen(false);
      return;
    }
    const next = quizzList.filter((_, idx) => idx !== current);
    const ok = await persistQuizz(
      next,
      { successMessage: "Question supprimee." },
      "delete-question"
    );
    if (ok) {
      const nextIndex = Math.max(0, current - 1);
      setCurrent(nextIndex);
      carouselRef.current?.goTo(nextIndex);
      setDeleteQuestionOpen(false);
    }
  };

  const handleSaveQuestion = async (qid, valueOverride) => {
    const targetId = qid || editQuestion.id;
    if (!targetId) return;
    const fallbackQuestion =
      quizzList.find((q) => q.id === targetId)?.question || "";
    const value = (
      valueOverride ??
      editQuestion.value ??
      fallbackQuestion
    ).trim();
    const next = quizzList.map((q) =>
      q.id === targetId ? { ...q, question: value } : q
    );
    const ok = await persistQuizz(
      next,
      { successMessage: "Intitule mis a jour." },
      getActionKey("question", targetId)
    );
    if (ok) {
      setEditQuestion({ id: null, value: "" });
    }
  };

  const handleAddOption = async () => {
    if (!optionInsert.qid) return;
    const value = optionInsert.value || "";
    const next = quizzList.map((q) => {
      if (q.id !== optionInsert.qid) return q;
      const insertIndex = resolveInsertIndex(
        q.options || [],
        optionInsert.position
      );
      const options = Array.isArray(q.options) ? [...q.options] : [];
      const adjustedCorrect =
        Number.isInteger(q.correct) && q.correct >= insertIndex
          ? q.correct + 1
          : q.correct;
      options.splice(insertIndex, 0, value);
      return { ...q, options, correct: adjustedCorrect };
    });
    const ok = await persistQuizz(
      next,
      { successMessage: "Option ajoutee." },
      getActionKey("add-option", optionInsert.qid)
    );
    if (ok) {
      setOptionInsert({ qid: null, position: "end", value: "" });
    }
  };

  const handleEditOption = async () => {
    if (!editOption.qid || editOption.index === null) return;
    const value = editOption.value || "";
    const next = quizzList.map((q) => {
      if (q.id !== editOption.qid) return q;
      const options = Array.isArray(q.options) ? [...q.options] : [];
      options[editOption.index] = value;
      return { ...q, options };
    });
    const ok = await persistQuizz(
      next,
      { successMessage: "Option mise a jour." },
      getActionKey("edit-option", editOption.qid, editOption.index)
    );
    if (ok) {
      setEditOption({ qid: null, index: null, value: "" });
    }
  };

  const handleDeleteOption = async (qid, index) => {
    const next = quizzList.map((q) => {
      if (q.id !== qid) return q;
      const options = Array.isArray(q.options)
        ? q.options.filter((_, idx) => idx !== index)
        : [];
      let correct = q.correct;
      if (Number.isInteger(correct)) {
        if (correct === index) {
          correct = null;
        } else if (correct > index) {
          correct = correct - 1;
        }
      }
      return { ...q, options, correct };
    });
    await persistQuizz(
      next,
      { successMessage: "Option supprimee." },
      getActionKey("delete-option", qid, index)
    );
  };

  const handleSelectCorrect = async (qid, optionIndex) => {
    const next = quizzList.map((q) =>
      q.id === qid ? { ...q, correct: optionIndex } : q
    );
    await persistQuizz(
      next,
      { successMessage: "Reponse correcte mise a jour." },
      getActionKey("correct", qid, optionIndex)
    );
  };

  const handleUploadImage = async (question, file) => {
    if (!question?.id || !file) return;
    const ext = `.${(file.name || "").split(".").pop()?.toLowerCase() || ""}`;
    if (!ALLOWED_IMAGE_EXT.includes(ext)) {
      message.error("Image non autorisee (jpg ou png).");
      return;
    }
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }
    setUploadingImageFor(question.id);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("questionId", question.id);
    formData.append("repertoire", repertoire || "");
    formData.append("num", `${num}`);

    try {
      const response = await fetch(`${urlFetch}/quizzs/${cardId}/image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (response.status === 401 || response.status === 403) {
        throw new Error("Session expirée ou droits insuffisants. Merci de vous reconnecter.");
      }
      let data = null;
      try {
        data = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(data?.error || "Upload impossible.");
      }
      const updatedCard = data?.result;
      if (updatedCard?.quizz) {
        setQuizzList(Array.isArray(updatedCard.quizz) ? updatedCard.quizz : []);
        syncCardsStore(updatedCard, updatedCard.quizz);
      }
      message.success("Image importee.");
    } catch (error) {
      console.error("Erreur upload image quizz", error);
      message.error(error.message || "Erreur lors de l'upload.");
    } finally {
      setUploadingImageFor("");
    }
  };

  const handleDeleteImage = async (question) => {
    if (!question?.id || !question?.image) {
      return;
    }
    if (!cardId) {
      message.error("Identifiant de carte manquant.");
      return;
    }
    const key = getActionKey("delete-image", question.id);
    setActionKey(key);
    try {
      const response = await fetch(`${urlFetch}/quizzs/${cardId}/image`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          questionId: question.id,
          image: question.image,
          repertoire: repertoire || "",
          num,
        }),
      });
      if (response.status === 401 || response.status === 403) {
        throw new Error("Session expirée ou droits insuffisants. Merci de vous reconnecter.");
      }
      let data = null;
      try {
        data = await response.json();
      } catch (_) {}
      if (!response.ok) {
        throw new Error(data?.error || "Suppression impossible.");
      }
      const updatedCard = data?.result;
      if (updatedCard?.quizz) {
        setQuizzList(Array.isArray(updatedCard.quizz) ? updatedCard.quizz : []);
        syncCardsStore(updatedCard, updatedCard.quizz);
      }
      message.success("Image supprimee.");
    } catch (error) {
      console.error("Erreur suppression image quizz", error);
      message.error(error.message || "Erreur lors de la suppression.");
    } finally {
      setActionKey("");
    }
  };

  const questionInsertionOptions = useMemo(() => {
    const options = [{ value: "start", label: "Debut (avant la premiere)" }];
    quizzList.forEach((q, idx) =>
      options.push({ value: idx, label: `Apres question ${idx + 1}` })
    );
    options.push({ value: "end", label: "Fin (apres la derniere)" });
    return options;
  }, [quizzList]);

  const optionInsertionOptions = (q) => {
    const opts = [{ value: "start", label: "Debut (avant la premiere)" }];
    (q.options || []).forEach((_, idx) =>
      opts.push({ value: idx, label: `Apres option ${idx + 1}` })
    );
    opts.push({ value: "end", label: "Fin (apres la derniere)" });
    return opts;
  };

  const buildUploadProps = (question) => ({
    accept: ALLOWED_IMAGE_EXT.join(","),
    maxCount: 1,
    beforeUpload: (file) => {
      handleUploadImage(question, file);
      return Upload.LIST_IGNORE;
    },
    showUploadList: false,
  });

  return (
    <div className="relative w-full">
      {actionKey && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/60">
          <ClimbingBoxLoader color="#2563eb" size={12} />
        </div>
      )}

      {/* Barre de progression */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems:"center",
          marginBottom: 12,
          marginTop: 12,
          gap: 5,
          padding: "1px 0px 0px 1px ",
          maxWidth: "100%",
        }}
      >
        {current > 0 && quizzList.length > 0 && (
          <Button
            type="default"
            shape="circle"
            onClick={handlePrev}
            style={{
              position: "relative",
              top: "14px",
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
            width: "80%",
            maxWidth: 500,
            height: 24,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: 2,
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
              width:"100%",
            }}
          >
            {quizzList.map((q, idx) => {
              const isCurrent = idx === current;
              const size = DOT + 4;
              const bg = isCurrent ? "#595959" : "#1890ff";
              return (
                <div
                  key={q.id || idx}
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

        {current < quizzList.length - 1 && quizzList.length > 0 && (
          <Button
            type="default"
            shape="circle"
            onClick={handleNext}
            style={{
              position: "relative",
              top: "14px",
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

      {/* Actions question */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Popover
          trigger="click"
          open={addQuestionOpen}
          onOpenChange={setAddQuestionOpen}
          content={
            <div className="w-72 space-y-2">
              <p className="m-0 text-sm text-gray-700">
                Choisir l'emplacement de la nouvelle question.
              </p>
              <Select
                className="w-full"
                value={questionInsertPos}
                options={questionInsertionOptions}
                onChange={setQuestionInsertPos}
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setAddQuestionOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  loading={isAction("add-question")}
                  onClick={handleAddQuestion}
                >
                  Ajouter
                </Button>
              </div>
            </div>
          }
        >
          <Button type="primary" icon={<PlusOutlined />}>
            Ajouter une question
          </Button>
        </Popover>

        <Popover
          trigger="click"
          open={deleteQuestionOpen}
          onOpenChange={setDeleteQuestionOpen}
          content={
            <div className="w-64 space-y-2">
              <p className="m-0 text-sm text-gray-700">
                Supprimer completement la question {current + 1} ?
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setDeleteQuestionOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={isAction("delete-question")}
                  onClick={handleDeleteQuestion}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          }
        >
          <Button danger icon={<DeleteOutlined />} disabled={!quizzList.length}>
            Supprimer la question
          </Button>
        </Popover>
      </div>

      {/* Carousel responsive */}
      <div className="w-full flex justify-center px-2 sm:px-4">
        <div style={{ width: "100%", maxWidth: 1200 }}>
          <Carousel
            ref={carouselRef}
            dots
            swipe
            draggable
            infinite={false}
            beforeChange={(_, to) => setCurrent(to)}
            afterChange={(i) => setCurrent(i)}
            adaptiveHeight
            className="w-full"
          >
            {quizzList.map((q, idx) => {
              const initialQuestionValue = q.question || "";
              const questionValue =
                editQuestion.id === q.id
                  ? editQuestion.value
                  : initialQuestionValue;
              const isQuestionEmpty = !questionValue.trim();
              const hasQuestionChanged = questionValue !== initialQuestionValue;
              const disableQuestionButton =
                isQuestionEmpty || !hasQuestionChanged;
              const questionButtonLabel = isQuestionEmpty ? "Saisir" : "Modifier";
              return (
                <div
                  key={q.id || idx}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <Card
                    style={{
                      margin: "8px auto",
                      width: "100%",
                      maxWidth: "1100px",
                      minWidth: "280px",
                      padding: "8px",
                    }}
                    title={
                      <div className="flex w-full flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Question {idx + 1} ({q.id || `q${idx + 1}`}) :
                        </label>
                        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:gap-3">
                          <Input.TextArea
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            className="!font-normal"
                            value={questionValue}
                            maxLength={500}
                            placeholder="Saisir l'intitule de la question"
                            onChange={(e) =>
                              setEditQuestion({ id: q.id, value: e.target.value })
                            }
                          />
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            className="sm:self-start sm:shrink-0"
                            style={{
                              opacity: disableQuestionButton ? 0.6 : 1,
                            }}
                            loading={isAction(getActionKey("question", q.id))}
                            disabled={disableQuestionButton}
                            onClick={() =>
                              handleSaveQuestion(q.id, questionValue)
                            }
                          >
                            {questionButtonLabel}
                          </Button>
                        </div>
                      </div>
                    }
                  >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-700">
                            Image (300x300)
                          </p>
                          <div className="flex gap-2">
                            <Upload {...buildUploadProps(q)}>
                              <Button
                                size="small"
                                icon={<UploadOutlined />}
                                loading={uploadingImageFor === q.id}
                              >
                                Uploader
                              </Button>
                            </Upload>
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              loading={isAction(
                                getActionKey("delete-image", q.id)
                              )}
                              disabled={!q.image}
                              onClick={() => handleDeleteImage(q)}
                            />
                          </div>
                        </div>
                        <div
                          className="flex items-center justify-center rounded border border-dashed border-gray-300 bg-white"
                          style={{
                            width: "100%",
                            maxWidth: 220,
                            aspectRatio: "1 / 1",
                            overflow: "hidden",
                          }}
                        >
                          {q.image ? (
                            <Image
                              src={`${racine}${q.image}`}
                              alt=""
                              width={220}
                              height={220}
                              style={{
                                objectFit: "cover",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          ) : (
                            <span className="text-xs text-gray-500">
                              Aucune image
                            </span>
                          )}
                        </div>
                        {q.image && (
                          <p className="text-xs text-gray-500 break-all">
                            {q.image}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">
                          Options
                        </p>
                        <Popover
                          trigger="click"
                          open={optionInsert.qid === q.id}
                          onOpenChange={(visible) => {
                            if (visible) {
                              setOptionInsert({
                                qid: q.id,
                                position: "end",
                                value: "",
                              });
                            } else if (optionInsert.qid === q.id) {
                              setOptionInsert({
                                qid: null,
                                position: "end",
                                value: "",
                              });
                            }
                          }}
                          content={
                            <div className="w-72 space-y-2">
                              <Input
                                placeholder="Nouvelle option"
                                value={optionInsert.value}
                                maxLength={300}
                                onChange={(e) =>
                                  setOptionInsert((prev) => ({
                                    ...prev,
                                    value: e.target.value,
                                  }))
                                }
                              />
                              <Select
                                className="w-full"
                                value={optionInsert.position}
                                options={optionInsertionOptions(q)}
                                onChange={(value) =>
                                  setOptionInsert((prev) => ({
                                    ...prev,
                                    position: value,
                                  }))
                                }
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="small"
                                  icon={<CloseOutlined />}
                                  onClick={() =>
                                    setOptionInsert({
                                      qid: null,
                                      position: "end",
                                      value: "",
                                    })
                                  }
                                >
                                  Annuler
                                </Button>
                                <Button
                                  size="small"
                                  type="primary"
                                  icon={<CheckOutlined />}
                                  loading={isAction(
                                    getActionKey("add-option", q.id)
                                  )}
                                  onClick={handleAddOption}
                                >
                                  Valider
                                </Button>
                              </div>
                            </div>
                          }
                        >
                          <Button size="small" icon={<PlusOutlined />}>
                            Ajouter une option
                          </Button>
                        </Popover>
                      </div>

                      <ul className="space-y-2">
                        {(q.options || []).map((op, optionIndex) => {
                          const editOpen =
                            editOption.qid === q.id &&
                            editOption.index === optionIndex;
                          return (
                            <li
                              key={`${q.id}-${optionIndex}`}
                              className="flex flex-col gap-1 rounded border border-gray-200 bg-white px-2 py-1 sm:flex-row sm:items-start sm:justify-between"
                            >
                              <div className="flex-1 flex items-start gap-2">
                                <Radio
                                  checked={q.correct === optionIndex}
                                  onChange={() =>
                                    handleSelectCorrect(q.id, optionIndex)
                                  }
                                />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Option {optionIndex + 1}
                                  </p>
                                  <p className="whitespace-pre-line break-words text-sm text-gray-800">
                                    {op || (
                                      <span className="text-gray-400">vide</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Popover
                                  trigger="click"
                                  open={editOpen}
                                  onOpenChange={(visible) => {
                                    if (visible) {
                                      setEditOption({
                                        qid: q.id,
                                        index: optionIndex,
                                        value: op || "",
                                      });
                                    } else if (editOpen) {
                                      setEditOption({
                                        qid: null,
                                        index: null,
                                        value: "",
                                      });
                                    }
                                  }}
                                  content={
                                    <div className="w-64 space-y-2">
                                      <Input
                                        value={editOption.value}
                                        maxLength={300}
                                        onChange={(e) =>
                                          setEditOption((prev) => ({
                                            ...prev,
                                            value: e.target.value,
                                          }))
                                        }
                                      />
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          size="small"
                                          icon={<CloseOutlined />}
                                          onClick={() =>
                                            setEditOption({
                                              qid: null,
                                              index: null,
                                              value: "",
                                            })
                                          }
                                        >
                                          Annuler
                                        </Button>
                                        <Button
                                          size="small"
                                          type="primary"
                                          icon={<CheckOutlined />}
                                          loading={isAction(
                                            getActionKey(
                                              "edit-option",
                                              q.id,
                                              optionIndex
                                            )
                                          )}
                                          onClick={handleEditOption}
                                        >
                                          Valider
                                        </Button>
                                      </div>
                                    </div>
                                  }
                                >
                                  <Button size="small" icon={<EditOutlined />} />
                                </Popover>
                                <Button
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                  loading={isAction(
                                    getActionKey(
                                      "delete-option",
                                      q.id,
                                      optionIndex
                                    )
                                  )}
                                  onClick={() =>
                                    handleDeleteOption(q.id, optionIndex)
                                  }
                                />
                              </div>
                            </li>
                          );
                        })}
                        {!q.options?.length && (
                          <li className="text-sm text-gray-500">
                            Aucune option pour le moment.
                          </li>
                        )}
                      </ul>

                      <div className="rounded border border-gray-200 bg-gray-50 px-2 py-2 text-sm">
                        <p className="m-0 text-xs text-gray-600">
                          Selectionner la bonne reponse
                        </p>
                        <p className="m-0 text-xs text-gray-500">
                          {Number.isInteger(q.correct)
                            ? `Option ${q.correct + 1}`
                            : "Aucune selection"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
          </Carousel>
        </div>
      </div>

      {/* Eval / resultat */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-2 rounded border border-gray-200 p-2">
          <p className="text-sm font-semibold text-gray-700">Mode évaluation</p>
          <Radio.Group
            value={localEvalQuizz}
            onChange={(e) =>
              persistQuizz(undefined, {
                evalValue: e.target.value,
                successMessage: "Mode évaluation mis a jour.",
              })
            }
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Radio value="non">Mode formatif</Radio>
            <Radio value="oui">Mode évaluation actif</Radio>
            <Radio value="attente">Mode évaluation en attente</Radio>
          </Radio.Group>
        </div>

        <div className="flex flex-col items-center gap-2 rounded border border-gray-200 p-2">
          <p className="text-sm font-semibold text-gray-700">Résultats quizz</p>
          <Radio.Group
            value={`${localResultatQuizz}`}
            onChange={(e) =>
              persistQuizz(undefined, {
                resultValue: e.target.value === "true",
                successMessage: "Etat d'affichage des resultats mis a jour.",
              })
            }
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Radio value="false">Résultats cachés</Radio>
            <Radio value="true">Résultats publiés</Radio>
          </Radio.Group>
        </div>
      </div>
    </div>
  );
}
