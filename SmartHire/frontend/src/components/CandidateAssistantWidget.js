import React, { useRef, useState } from "react";
import { askCandidateAssistant } from "../services/chatbotService";

const quickQuestions = [
  "Care este statusul aplicarilor mele?",
  "Am interviuri programate?",
  "Pot sa reprogramez un interviu?",
  "Ce fac daca nu pot ajunge la interviu?",
  "Pot sa imi retrag candidatura?",
];

const localAnswers = [
  {
    keywords: ["reprogramez", "reprograma", "reprogramare"],
    answer:
      "Da, poti solicita reprogramarea unui interviu daca acesta este in status Programat. Poti face asta din pagina Interviurile mele sau din detaliile aplicarii. Dupa solicitare, recruiterul sau managerul va actualiza data si ora interviului.",
  },
  {
    keywords: ["nu pot ajunge", "nu ajung", "anulez interviu", "anula interviu"],
    answer:
      "Daca nu poti ajunge la interviu, poti solicita reprogramarea sau poti anula interviul din pagina Interviurile mele. Este recomandat sa faci asta inainte de ora interviului, ca echipa de recrutare sa fie informata.",
  },
  {
    keywords: ["retrag", "retrage", "retrag candidatura"],
    answer:
      "Da, poti retrage o candidatura daca aceasta nu este deja acceptata sau respinsa. Dupa retragere, procesul pentru acea candidatura se opreste, iar interviurile active asociate sunt anulate automat.",
  },
  {
    keywords: ["cv", "incarc cv", "adaug cv"],
    answer:
      "Iti poti gestiona CV-urile din pagina CV-urile mele. Acolo poti incarca un CV nou si il poti folosi cand aplici la un job activ.",
  },
];

const getLocalAnswer = (text) => {
  const normalizedText = text.toLowerCase();
  const matchedAnswer = localAnswers.find((item) =>
    item.keywords.some((keyword) => normalizedText.includes(keyword))
  );

  return matchedAnswer?.answer || "";
};

const initialMessages = [
  {
    id: "welcome",
    sender: "assistant",
    text:
      "Buna! Sunt Smarty, asistentul virtual SmartHire. Te pot ajuta cu informatii despre aplicarile tale, interviuri, notificari si urmatorii pasi din procesul de recrutare.",
  },
  {
    id: "scope",
    sender: "assistant",
    text:
      "Raspunsurile sunt generate pe baza informatiilor disponibile in aplicatie.",
  },
  {
    id: "suggestions",
    sender: "assistant",
    type: "suggestions",
    text: "Poti incepe cu una dintre intrebarile de mai jos:",
  },
];

function CandidateAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messageIdRef = useRef(0);

  const addMessage = (sender, text) => {
    messageIdRef.current += 1;
    const message = {
      id: `${sender}-${messageIdRef.current}`,
      sender,
      text,
    };

    setMessages((currentMessages) => [...currentMessages, message]);
  };

  const sendQuestion = async (text) => {
    const trimmedQuestion = text.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    setQuestion("");
    setError("");
    addMessage("user", trimmedQuestion);

    const localAnswer = getLocalAnswer(trimmedQuestion);

    if (localAnswer) {
      addMessage("assistant", localAnswer);
      return;
    }

    setIsLoading(true);

    try {
      const data = await askCandidateAssistant(trimmedQuestion);
      addMessage(
        "assistant",
        data.answer || "Nu am putut genera un raspuns pentru aceasta intrebare."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Asistentul virtual nu este disponibil momentan."
      );
      addMessage(
        "assistant",
        "Nu pot raspunde momentan. Incearca din nou peste cateva momente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendQuestion(question);
  };

  return (
    <div className="assistant-widget">
      {isOpen && (
        <section className="assistant-panel" aria-label="Smarty, asistent virtual">
          <div className="assistant-header">
            <div>
              <h2>Smarty</h2>
              <p>Asistentul virtual SmartHire</p>
            </div>

            <button
              type="button"
              className="icon-button assistant-close"
              onClick={() => setIsOpen(false)}
              aria-label="Inchide Smarty"
            >
              x
            </button>
          </div>

          <div className="assistant-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`assistant-message assistant-message-${message.sender}${
                  message.type === "suggestions" ? " assistant-message-suggestions" : ""
                }`}
              >
                <p>{message.text}</p>

                {message.type === "suggestions" && (
                  <div className="assistant-suggestion-list">
                    {quickQuestions.map((quickQuestion) => (
                      <button
                        type="button"
                        key={quickQuestion}
                        onClick={() => sendQuestion(quickQuestion)}
                        disabled={isLoading}
                      >
                        {quickQuestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="assistant-message assistant-message-assistant">
                <p>Generez raspunsul...</p>
              </div>
            )}
          </div>

          {error && <p className="assistant-error">{error}</p>}

          <form className="assistant-form" onSubmit={handleSubmit}>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Scrie o intrebare..."
              maxLength="500"
              disabled={isLoading}
            />

            <button type="submit" disabled={isLoading || !question.trim()}>
              Trimite
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="assistant-toggle"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label="Deschide Smarty"
      >
        <span className="assistant-toggle-icon" aria-hidden="true">
          <span className="assistant-robot">
            <span className="assistant-robot-eye" />
            <span className="assistant-robot-eye" />
          </span>
          <span className="assistant-chat-bubble" />
        </span>
      </button>
    </div>
  );
}

export default CandidateAssistantWidget;
