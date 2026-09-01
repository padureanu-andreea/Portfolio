import React, { useEffect, useMemo, useState } from "react";

const technicalInterviewTypes = ["TEHNIC_ONLINE", "TEHNIC_FIZIC"];

export const feedbackRecommendationLabels = {
  CONTINUA_IN_ETAPA_URMATOARE: "Continua in etapa urmatoare",
  REZERVA: "Se pastreaza ca rezerva",
  CLARIFICARI_SUPLIMENTARE: "Necesita clarificari suplimentare",
  NU_SE_RECOMANDA_CONTINUAREA_PROCESULUI:
    "Nu se recomanda continuarea procesului",
};

export const parseFeedbackContent = (value) => {
  if (!value) {
    return {
      experienta_claritate: "",
      comunicare_atitudine_motivatie: "",
      evaluare_tehnica: "",
      concluzie_generala: "",
      motivare_recomandare: "",
      legacyText: "",
    };
  }

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;

    return {
      experienta_claritate: parsed.experienta_claritate || "",
      comunicare_atitudine_motivatie:
        parsed.comunicare_atitudine_motivatie || "",
      evaluare_tehnica: parsed.evaluare_tehnica || "",
      concluzie_generala: parsed.concluzie_generala || "",
      motivare_recomandare: parsed.motivare_recomandare || "",
      legacyText: "",
    };
  } catch {
    return {
      experienta_claritate: "",
      comunicare_atitudine_motivatie: "",
      evaluare_tehnica: "",
      concluzie_generala: "",
      motivare_recomandare: "",
      legacyText: value,
    };
  }
};

export const buildFeedbackFromInterview = (interview) => {
  if (!interview?.id_feedback) {
    return null;
  }

  return {
    id_feedback: interview.id_feedback,
    id_interviu: interview.id_interviu,
    id_autor: interview.feedback_id_autor,
    continut_feedback: interview.feedback_continut_feedback,
    rating_candidat: interview.feedback_rating_candidat,
    recomandare_finala: interview.feedback_recomandare_finala,
    data_feedback: interview.feedback_data_feedback,
  };
};

export function FeedbackDetails({ feedback }) {
  if (!feedback) {
    return <p>Nu exista feedback salvat pentru acest interviu.</p>;
  }

  const content = parseFeedbackContent(feedback.continut_feedback);

  if (content.legacyText) {
    return (
      <div className="feedback-details">
        <p>{content.legacyText}</p>
        <p>
          <strong>Recomandare:</strong>{" "}
          {feedbackRecommendationLabels[feedback.recomandare_finala] ||
            feedback.recomandare_finala ||
            "-"}
        </p>
      </div>
    );
  }

  return (
    <div className="feedback-details">
      <div>
        <span>Experienta si claritatea raspunsurilor</span>
        <p>{content.experienta_claritate || "-"}</p>
      </div>

      <div>
        <span>Comunicare, atitudine si motivatie</span>
        <p>{content.comunicare_atitudine_motivatie || "-"}</p>
      </div>

      {content.evaluare_tehnica && (
        <div>
          <span>Evaluare tehnica</span>
          <p>{content.evaluare_tehnica}</p>
        </div>
      )}

      <div>
        <span>Concluzie generala</span>
        <p>{content.concluzie_generala || "-"}</p>
      </div>

      <div>
        <span>Recomandare</span>
        <p>
          {feedbackRecommendationLabels[feedback.recomandare_finala] ||
            feedback.recomandare_finala ||
            "-"}
        </p>
      </div>

      <div>
        <span>Motivarea recomandarii</span>
        <p>{content.motivare_recomandare || "-"}</p>
      </div>
    </div>
  );
}

function FeedbackModal({
  interview,
  candidateName,
  jobTitle,
  interviewerName,
  interviewTypeLabel,
  formatDateTime,
  onClose,
  onSubmit,
  onDelete,
  isSaving,
}) {
  const existingFeedback = buildFeedbackFromInterview(interview);
  const existingContent = useMemo(
    () => parseFeedbackContent(existingFeedback?.continut_feedback),
    [existingFeedback?.continut_feedback]
  );
  const isTechnicalInterview = technicalInterviewTypes.includes(
    interview?.tip_interviu
  );

  const [formData, setFormData] = useState({
    experienta_claritate: "",
    comunicare_atitudine_motivatie: "",
    evaluare_tehnica: "",
    concluzie_generala: "",
    recomandare_finala: "CONTINUA_IN_ETAPA_URMATOARE",
    motivare_recomandare: "",
  });

  useEffect(() => {
    setFormData({
      experienta_claritate: existingContent.experienta_claritate,
      comunicare_atitudine_motivatie:
        existingContent.comunicare_atitudine_motivatie,
      evaluare_tehnica: existingContent.evaluare_tehnica,
      concluzie_generala: existingContent.concluzie_generala,
      recomandare_finala:
        existingFeedback?.recomandare_finala ||
        "CONTINUA_IN_ETAPA_URMATOARE",
      motivare_recomandare: existingContent.motivare_recomandare,
    });
  }, [existingContent, existingFeedback?.recomandare_finala]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const feedbackContent = {
      experienta_claritate: formData.experienta_claritate.trim(),
      comunicare_atitudine_motivatie:
        formData.comunicare_atitudine_motivatie.trim(),
      evaluare_tehnica: isTechnicalInterview
        ? formData.evaluare_tehnica.trim()
        : "",
      concluzie_generala: formData.concluzie_generala.trim(),
      motivare_recomandare: formData.motivare_recomandare.trim(),
    };

    onSubmit({
      feedbackId: existingFeedback?.id_feedback,
      payload: {
        id_interviu: interview.id_interviu,
        continut_feedback: JSON.stringify(feedbackContent),
        rating_candidat: null,
        recomandare_finala: formData.recomandare_finala,
      },
    });
  };

  return (
    <div className="modal-overlay" role="presentation">
      <form className="modal-panel wide-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>
              {existingFeedback ? "Editeaza feedback" : "Adauga feedback"}
            </h2>
            <p>Feedback intern pentru interviul finalizat.</p>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Inchide"
          >
            x
          </button>
        </div>

        <div className="detail-grid">
          <div>
            <span>Candidat</span>
            <strong>{candidateName || "-"}</strong>
          </div>
          <div>
            <span>Job</span>
            <strong>{jobTitle || "-"}</strong>
          </div>
          <div>
            <span>Interviu</span>
            <strong>{interviewTypeLabel || "-"}</strong>
          </div>
          <div>
            <span>Data si ora</span>
            <strong>{formatDateTime(interview.data_interviu)}</strong>
          </div>
          <div>
            <span>Intervievator</span>
            <strong>{interviewerName || "-"}</strong>
          </div>
        </div>

        <label>
          Observatii privind experienta si claritatea raspunsurilor
          <span className="field-question">
            Cum a prezentat candidatul experienta sa profesionala si cat de clar
            a raspuns la intrebarile legate de rol?
          </span>
          <textarea
            name="experienta_claritate"
            value={formData.experienta_claritate}
            onChange={handleChange}
            rows="4"
            maxLength="2000"
            required
          />
        </label>

        <label>
          Observatii privind comunicarea, atitudinea si motivatia
          <span className="field-question">
            Cum s-a comportat candidatul in timpul interviului din punct de
            vedere al comunicarii, atitudinii si motivatiei?
          </span>
          <textarea
            name="comunicare_atitudine_motivatie"
            value={formData.comunicare_atitudine_motivatie}
            onChange={handleChange}
            rows="4"
            maxLength="2000"
            required
          />
        </label>

        {isTechnicalInterview && (
          <label>
            Observatii privind evaluarea tehnica
            <span className="field-question">
              Cum s-a descurcat candidatul la testul, intrebarile sau partea
              tehnica a interviului?
            </span>
            <textarea
              name="evaluare_tehnica"
              value={formData.evaluare_tehnica}
              onChange={handleChange}
              rows="4"
              maxLength="2000"
              required
            />
          </label>
        )}

        <label>
          Concluzie generala
          <span className="field-question">
            Care este concluzia generala dupa interviu si ce recomandare se face
            pentru acest candidat?
          </span>
          <textarea
            name="concluzie_generala"
            value={formData.concluzie_generala}
            onChange={handleChange}
            rows="4"
            maxLength="2000"
            required
          />
        </label>

        <label>
          Recomandare
          <select
            name="recomandare_finala"
            value={formData.recomandare_finala}
            onChange={handleChange}
            required
          >
            {Object.entries(feedbackRecommendationLabels).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Motivarea recomandarii
          <textarea
            name="motivare_recomandare"
            value={formData.motivare_recomandare}
            onChange={handleChange}
            rows="4"
            maxLength="2000"
            required
          />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={isSaving}>
            Salveaza feedback
          </button>

          {existingFeedback && onDelete && (
            <button
              type="button"
              className="danger-button"
              onClick={() => onDelete(existingFeedback.id_feedback)}
              disabled={isSaving}
            >
              Sterge feedback
            </button>
          )}

          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={isSaving}
          >
            Anuleaza
          </button>
        </div>
      </form>
    </div>
  );
}

export default FeedbackModal;
