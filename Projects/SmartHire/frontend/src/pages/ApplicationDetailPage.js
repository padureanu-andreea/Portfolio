import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getApplicationDetails,
  updateApplicationStatus,
} from "../services/applicationService";
import { downloadCv } from "../services/cvService";
import { calculateApplicationScore } from "../services/scoringService";
import {
  createFeedback,
  deleteFeedback,
  updateFeedback,
} from "../services/feedbackService";
import {
  cancelInterview,
  createInterview,
  markInterviewNoShow,
  requestInterviewReschedule,
  updateInterview,
} from "../services/interviewService";
import { useAuth } from "../context/AuthContext";
import FeedbackModal, {
  buildFeedbackFromInterview,
  FeedbackDetails,
  feedbackRecommendationLabels,
} from "../components/FeedbackModal";

const statuses = ["DEPUSA", "IN_ANALIZA", "ACCEPTATA", "RESPINSA", "RETRASA"];

const statusLabels = {
  DEPUSA: "Depusa",
  IN_ANALIZA: "In analiza",
  ACCEPTATA: "Acceptata",
  RESPINSA: "Respinsa",
  RETRASA: "Retrasa",
};

const interviewStatusLabels = {
  PROGRAMAT: "Programat",
  FINALIZAT: "Finalizat",
  ANULAT: "Anulat",
  REPROGRAMARE_SOLICITATA: "Reprogramare solicitata",
  NEPREZENTAT: "Neprezentat",
};

const interviewTypeLabels = {
  HR_ONLINE: "HR online",
  HR_FIZIC: "HR fizic",
  HR_TELEFONIC: "HR telefonic",
  TEHNIC_ONLINE: "Tehnic online",
  TEHNIC_FIZIC: "Tehnic fizic",
};

const hrInterviewTypes = ["HR_ONLINE", "HR_FIZIC", "HR_TELEFONIC"];
const technicalInterviewTypes = ["TEHNIC_ONLINE", "TEHNIC_FIZIC"];
const activeInterviewStatuses = ["PROGRAMAT", "REPROGRAMARE_SOLICITATA"];
const feedbackInterviewStatuses = ["FINALIZAT", "NEPREZENTAT"];

const toDatetimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const scoreLabels = {
  hardSkillsScore: "Competente tehnice",
  softSkillsScore: "Competente soft",
  experienceScore: "Experienta",
  projectsScore: "Proiecte",
  educationScore: "Educatie",
  volunteeringScore: "Voluntariat",
};

const semanticScoreLabels = {
  overall: "Potrivire generala cu jobul",
  technical_skills: "Competente tehnice",
  experience: "Experienta relevanta",
  projects: "Proiecte relevante",
  education: "Educatie",
  soft_skills: "Competente soft",
  certifications: "Certificari",
  cv_completeness: "Completitudine CV",
};

const parseAiSummary = (summary) => {
  if (!summary) {
    return null;
  }

  try {
    return JSON.parse(summary);
  } catch {
    return null;
  }
};

const parseMissingSkills = (value) => {
  if (!value) {
    return {
      obligatorii: [],
      optionale: [],
      legacyText: "",
    };
  }

  try {
    const parsed = JSON.parse(value);

    return {
      obligatorii: Array.isArray(parsed.obligatorii)
        ? parsed.obligatorii
        : Array.isArray(parsed.required)
          ? parsed.required
        : [],
      optionale: Array.isArray(parsed.optionale)
        ? parsed.optionale
        : Array.isArray(parsed.optional)
          ? parsed.optional
          : [],
      legacyText: "",
    };
  } catch {
    return {
      obligatorii: [],
      optionale: [],
      legacyText: value,
    };
  }
};

const formatScoreValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  return Number.isNaN(numericValue) ? value : numericValue.toFixed(2);
};

const getScoreStatus = (score) => {
  if (score === null || score === undefined) {
    return {
      label: "Scor necalculat",
      tone: "warning",
      description: "Calculeaza scorul pentru a avea o evaluare completa.",
    };
  }

  return {
    label: `${score} puncte`,
    tone: Number(score) >= 70 ? "success" : "info",
    description: "Scorul de compatibilitate este disponibil.",
  };
};

const getStageStatus = ({ finalizedInterview, activeInterview, feedback }) => {
  if (feedback) {
    return {
      label: "Feedback completat",
      tone: "success",
      description:
        feedbackRecommendationLabels[feedback.recomandare_finala] ||
        feedback.recomandare_finala ||
        "Feedbackul este salvat.",
    };
  }

  if (finalizedInterview) {
    return {
      label: "Interviu finalizat",
      tone: "warning",
      description: "Feedbackul trebuie completat pentru aceasta etapa.",
    };
  }

  if (activeInterview) {
    return {
      label: "Interviu programat",
      tone: "info",
      description: formatDateTime(activeInterview.data_interviu),
    };
  }

  return {
    label: "Neprogramat",
    tone: "neutral",
    description: "Aceasta etapa nu are inca un interviu activ.",
  };
};

const getDecisionMessage = ({
  applicationStatus,
  scoreStatus,
  hrStatus,
  technicalStatus,
}) => {
  if (applicationStatus === "ACCEPTATA") {
    return "Candidatura este acceptata.";
  }

  if (applicationStatus === "RESPINSA") {
    return "Candidatura este respinsa.";
  }

  if (applicationStatus === "RETRASA") {
    return "Candidatura a fost retrasa de candidat.";
  }

  if (
    scoreStatus.tone === "success" &&
    hrStatus.tone === "success" &&
    technicalStatus.tone === "success"
  ) {
    return "Toate etapele principale sunt completate. Candidatura poate fi decisa.";
  }

  return "Candidatura este inca in evaluare. Verifica etapele lipsa inainte de decizia finala.";
};

const getNextActionMessage = ({
  application,
  hasScore,
  activeHrInterview,
  finalizedHrInterview,
  hrFeedback,
  activeTechnicalInterview,
  finalizedTechnicalInterview,
  technicalFeedback,
}) => {
  if (application.status === "RETRASA") {
    return "Candidatura a fost retrasa. Pastreaza informatiile pentru istoric, fara actiuni noi.";
  }

  if (application.status === "ACCEPTATA") {
    return "Candidatura este acceptata. Procesul de evaluare este finalizat.";
  }

  if (application.status === "RESPINSA") {
    return "Candidatura este respinsa. Procesul de evaluare este finalizat.";
  }

  if (!hasScore) {
    return "Calculeaza scorul de compatibilitate pentru a incepe evaluarea structurata.";
  }

  if (!activeHrInterview && !finalizedHrInterview) {
    return "Programeaza interviul HR sau pastreaza candidatura in analiza pana la urmatoarea etapa.";
  }

  if (finalizedHrInterview && !hrFeedback) {
    return "Completeaza feedbackul pentru interviul HR inainte de etapa tehnica.";
  }

  if (hrFeedback && !activeTechnicalInterview && !finalizedTechnicalInterview) {
    return "Candidatul poate trece la interviul tehnic, daca managerul considera etapa HR potrivita.";
  }

  if (finalizedTechnicalInterview && !technicalFeedback) {
    return "Completeaza feedbackul tehnic pentru a avea baza finala de decizie.";
  }

  if (hrFeedback && technicalFeedback) {
    return "Toate informatiile principale sunt disponibile. Poti lua decizia finala.";
  }

  return "Urmareste interviurile programate si actualizeaza statusul cand apar rezultate noi.";
};

const getWorkflowSteps = ({
  application,
  hasScore,
  activeHrInterview,
  finalizedHrInterview,
  hrFeedback,
  activeTechnicalInterview,
  finalizedTechnicalInterview,
  technicalFeedback,
}) => {
  const isStopped =
    application.status === "RETRASA" || application.status === "RESPINSA";
  const hasFinalDecision =
    application.status === "ACCEPTATA" || application.status === "RESPINSA";

  return [
    {
      title: "Aplicare depusa",
      status: "done",
      detail: application.data_aplicare
        ? new Date(application.data_aplicare).toLocaleDateString("ro-RO")
        : "Candidatura a fost inregistrata.",
    },
    {
      title: "Scor compatibilitate",
      status: hasScore ? "done" : isStopped ? "upcoming" : "current",
      detail: hasScore
        ? `${application.scor_compatibilitate} puncte`
        : "Scorul nu este calculat.",
    },
    {
      title: "Interviu HR",
      status: hrFeedback
        ? "done"
        : isStopped
          ? "upcoming"
          : activeHrInterview || finalizedHrInterview || hasScore
            ? "current"
            : "upcoming",
      detail: hrFeedback
        ? "Feedback HR salvat."
        : activeHrInterview
          ? `Programat: ${formatDateTime(activeHrInterview.data_interviu)}`
          : finalizedHrInterview
            ? "Finalizat, necesita feedback."
            : "Nu este programat.",
    },
    {
      title: "Interviu tehnic",
      status: technicalFeedback
        ? "done"
        : isStopped
          ? "upcoming"
          : activeTechnicalInterview || finalizedTechnicalInterview || hrFeedback
            ? "current"
            : "upcoming",
      detail: technicalFeedback
        ? "Feedback tehnic salvat."
        : activeTechnicalInterview
          ? `Programat: ${formatDateTime(activeTechnicalInterview.data_interviu)}`
          : finalizedTechnicalInterview
            ? "Finalizat, necesita feedback."
            : "Nu este programat.",
    },
    {
      title: "Decizie finala",
      status: hasFinalDecision
        ? application.status === "RESPINSA"
          ? "stopped"
          : "done"
        : isStopped
          ? "stopped"
          : hrFeedback && technicalFeedback
            ? "current"
            : "upcoming",
      detail: hasFinalDecision
        ? statusLabels[application.status]
        : "Acceptare sau respingere.",
    },
  ];
};

function ApplicationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [application, setApplication] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [interviewFormError, setInterviewFormError] = useState("");
  const [interviewForm, setInterviewForm] = useState({
    data_interviu: "",
    tip_interviu: user?.rol === "MANAGER" ? "TEHNIC_ONLINE" : "HR_ONLINE",
    link_meeting: "",
  });
  const [editingInterviewId, setEditingInterviewId] = useState(null);
  const [editInterviewFormError, setEditInterviewFormError] = useState("");
  const [editInterviewForm, setEditInterviewForm] = useState({
    data_interviu: "",
    tip_interviu: "",
    link_meeting: "",
  });
  const [feedbackInterview, setFeedbackInterview] = useState(null);
  const [cvPreviewUrl, setCvPreviewUrl] = useState("");

  const canManageApplication =
    user?.rol === "RECRUTOR" ||
    user?.rol === "MANAGER" ||
    user?.rol === "ADMIN";
  const canViewFeedback =
    user?.rol === "RECRUTOR" || user?.rol === "MANAGER";

  const isWithdrawn = application?.status === "RETRASA";
  const isFinalDecision =
    application?.status === "ACCEPTATA" || application?.status === "RESPINSA";
  const aiSummary = parseAiSummary(application?.rezumat_ai);
  const aiAnalysis = aiSummary?.aiAnalysis || null;
  const semanticScores = aiAnalysis?.semantic_scores || null;
  const detectedStrengths = Array.isArray(aiAnalysis?.detected_strengths)
    ? aiAnalysis.detected_strengths
    : [];
  const incompleteSections = Array.isArray(aiAnalysis?.incomplete_sections)
    ? aiAnalysis.incomplete_sections
    : [];
  const missingSkills = parseMissingSkills(application?.competente_lipsa);
  const hasMissingSkills =
    missingSkills.obligatorii.length > 0 ||
    missingSkills.optionale.length > 0 ||
    Boolean(missingSkills.legacyText);
  const interviews = application?.interviews || [];
  const finalizedHrInterview = interviews.find(
    (interview) =>
      hrInterviewTypes.includes(interview.tip_interviu) &&
      interview.status === "FINALIZAT"
  );
  const finalizedTechnicalInterview = interviews.find(
    (interview) =>
      technicalInterviewTypes.includes(interview.tip_interviu) &&
      interview.status === "FINALIZAT"
  );
  const activeHrInterview = interviews.find(
    (interview) =>
      hrInterviewTypes.includes(interview.tip_interviu) &&
      activeInterviewStatuses.includes(interview.status)
  );
  const activeTechnicalInterview = interviews.find(
    (interview) =>
      technicalInterviewTypes.includes(interview.tip_interviu) &&
      activeInterviewStatuses.includes(interview.status)
  );
  const hrFeedback = interviews
    .filter((interview) => hrInterviewTypes.includes(interview.tip_interviu))
    .map((interview) => buildFeedbackFromInterview(interview))
    .find(Boolean);
  const technicalFeedback = interviews
    .filter((interview) =>
      technicalInterviewTypes.includes(interview.tip_interviu)
    )
    .map((interview) => buildFeedbackFromInterview(interview))
    .find(Boolean);
  const scoreStatus = getScoreStatus(application?.scor_compatibilitate);
  const hrEvaluationStatus = getStageStatus({
    finalizedInterview: finalizedHrInterview,
    activeInterview: activeHrInterview,
    feedback: hrFeedback,
  });
  const technicalEvaluationStatus = getStageStatus({
    finalizedInterview: finalizedTechnicalInterview,
    activeInterview: activeTechnicalInterview,
    feedback: technicalFeedback,
  });
  const hasScore =
    application?.scor_compatibilitate !== null &&
    application?.scor_compatibilitate !== undefined;
  const decisionMessage = getDecisionMessage({
    applicationStatus: application?.status,
    scoreStatus,
    hrStatus: hrEvaluationStatus,
    technicalStatus: technicalEvaluationStatus,
  });
  const nextActionMessage = application
    ? getNextActionMessage({
        application,
        hasScore,
        activeHrInterview,
        finalizedHrInterview,
        hrFeedback,
        activeTechnicalInterview,
        finalizedTechnicalInterview,
        technicalFeedback,
      })
    : "";
  const workflowSteps = application
    ? getWorkflowSteps({
        application,
        hasScore,
        activeHrInterview,
        finalizedHrInterview,
        hrFeedback,
        activeTechnicalInterview,
        finalizedTechnicalInterview,
        technicalFeedback,
      })
    : [];
  const hasFinalizedHrInterview = interviews.some(
    (interview) =>
      hrInterviewTypes.includes(interview.tip_interviu) &&
      interview.status === "FINALIZAT"
  );
  const hasActiveHrInterview = interviews.some(
    (interview) =>
      hrInterviewTypes.includes(interview.tip_interviu) &&
      activeInterviewStatuses.includes(interview.status)
  );
  const hasActiveTechnicalInterview = interviews.some(
    (interview) =>
      technicalInterviewTypes.includes(interview.tip_interviu) &&
      activeInterviewStatuses.includes(interview.status)
  );
  const interviewOptions =
    user?.rol === "MANAGER"
      ? technicalInterviewTypes
      : user?.rol === "RECRUTOR"
        ? hrInterviewTypes
      : [...hrInterviewTypes, ...technicalInterviewTypes];
  const canManageFeedbackForInterview = (interview) => {
    if (!canManageApplication || !feedbackInterviewStatuses.includes(interview.status)) {
      return false;
    }

    if (user?.rol === "RECRUTOR") {
      return hrInterviewTypes.includes(interview.tip_interviu);
    }

    if (user?.rol === "MANAGER") {
      return technicalInterviewTypes.includes(interview.tip_interviu);
    }

    return false;
  };
  const canManageInterviewStage = (interview) => {
    if (!canManageApplication || !interview) {
      return false;
    }

    if (user?.rol === "ADMIN") {
      return true;
    }

    if (user?.rol === "RECRUTOR") {
      return hrInterviewTypes.includes(interview.tip_interviu);
    }

    if (user?.rol === "MANAGER") {
      return technicalInterviewTypes.includes(interview.tip_interviu);
    }

    return false;
  };
  const canScheduleInterview =
    canManageApplication &&
    !isWithdrawn &&
    ((user?.rol === "RECRUTOR" && !hasActiveHrInterview) ||
      (user?.rol === "MANAGER" &&
        application?.status === "IN_ANALIZA" &&
        hasFinalizedHrInterview &&
        !hasActiveTechnicalInterview) ||
      user?.rol === "ADMIN");

  const loadApplication = useCallback(async () => {
    try {
      setError("");
      const data = await getApplicationDetails(id);
      setApplication(data);
      setSelectedStatus(data.status);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nu s-au putut incarca detaliile aplicarii."
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  useEffect(() => {
    return () => {
      if (cvPreviewUrl) {
        window.URL.revokeObjectURL(cvPreviewUrl);
      }
    };
  }, [cvPreviewUrl]);

  const handleDownloadCv = async () => {
    setError("");
    setMessage("");

    try {
      const fileBlob = await downloadCv(application.id_cv);
      const fileUrl = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = application.nume_fisier || "cv.pdf";
      link.click();

      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut descarca CV-ul.");
    }
  };

  const handlePreviewCv = async () => {
    setError("");
    setMessage("");

    try {
      const fileBlob = await downloadCv(application.id_cv);
      const fileUrl = window.URL.createObjectURL(fileBlob);
      setCvPreviewUrl(fileUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut previzualiza CV-ul.");
    }
  };

  const handleCloseCvPreview = () => {
    setCvPreviewUrl("");
  };

  const handleInterviewChange = (event) => {
    const { name, value } = event.target;

    setInterviewForm((currentData) => ({
      ...currentData,
      [name]: value,
    }));
    setInterviewFormError("");
  };

  const startEditingInterview = (interview) => {
    setEditingInterviewId(interview.id_interviu);
    setEditInterviewForm({
      data_interviu: toDatetimeLocalValue(interview.data_interviu),
      tip_interviu: interview.tip_interviu || interviewOptions[0],
      link_meeting: interview.link_meeting || "",
    });
    setError("");
    setMessage("");
    setEditInterviewFormError("");
  };

  const cancelEditingInterview = () => {
    setEditingInterviewId(null);
    setEditInterviewForm({
      data_interviu: "",
      tip_interviu: "",
      link_meeting: "",
    });
  };

  const handleEditInterviewChange = (event) => {
    const { name, value } = event.target;

    setEditInterviewForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setEditInterviewFormError("");
  };

  const handleUpdateInterviewSchedule = async (event) => {
    event.preventDefault();

    if (!editingInterviewId) {
      return;
    }

    if (!editInterviewForm.data_interviu) {
      setEditInterviewFormError("Alege data si ora interviului.");
      return;
    }

    if (new Date(editInterviewForm.data_interviu) <= new Date()) {
      setEditInterviewFormError("Data interviului trebuie sa fie in viitor.");
      return;
    }

    setError("");
    setMessage("");
    setEditInterviewFormError("");
    setIsSaving(true);

    try {
      await updateInterview(editingInterviewId, {
        data_interviu: editInterviewForm.data_interviu,
        tip_interviu: editInterviewForm.tip_interviu,
        link_meeting: editInterviewForm.link_meeting,
        status: "PROGRAMAT",
      });

      setMessage("Interviul a fost actualizat si programat din nou.");
      cancelEditingInterview();
      await loadApplication();
    } catch (err) {
      setEditInterviewFormError(
        err.response?.data?.message ||
          "Nu s-a putut actualiza interviul."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateInterview = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setInterviewFormError("");
    setIsSaving(true);

    try {
      if (new Date(interviewForm.data_interviu) <= new Date()) {
        setInterviewFormError("Data interviului trebuie sa fie in viitor.");
        setIsSaving(false);
        return;
      }

      await createInterview({
        id_aplicatie: Number(id),
        data_interviu: interviewForm.data_interviu,
        tip_interviu: interviewForm.tip_interviu,
        link_meeting: interviewForm.link_meeting,
      });

      setMessage("Interviul a fost programat cu succes.");

      setInterviewForm({
        data_interviu: "",
        tip_interviu: user?.rol === "MANAGER" ? "TEHNIC_ONLINE" : "HR_ONLINE",
        link_meeting: "",
      });

      await loadApplication();
    } catch (err) {
      setInterviewFormError(
        err.response?.data?.message || "Nu s-a putut programa interviul."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await updateApplicationStatus(id, selectedStatus);
      setMessage("Statusul aplicarii a fost actualizat.");
      await loadApplication();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut actualiza statusul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDecisionStatusUpdate = async (status) => {
    const confirmed = window.confirm(
      `Sigur vrei sa setezi candidatura ca ${statusLabels[status]}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await updateApplicationStatus(id, status);
      setSelectedStatus(status);
      setMessage("Decizia a fost salvata.");
      await loadApplication();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut salva decizia.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCalculateScore = async () => {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await calculateApplicationScore(id);
      setMessage("Scorul a fost calculat cu succes.");
      await loadApplication();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut calcula scorul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelInterview = async (interviewId) => {
    const confirmed = window.confirm("Sigur vrei sa anulezi interviul?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await cancelInterview(interviewId);
      setMessage("Interviul a fost anulat.");
      await loadApplication();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut anula interviul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelManagedInterview = async (interviewId) => {
    const confirmed = window.confirm("Sigur vrei sa anulezi interviul?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await updateInterview(interviewId, {
        status: "ANULAT",
      });

      setMessage("Interviul a fost anulat.");
      await loadApplication();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut anula interviul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestReschedule = async (interviewId) => {
    const confirmed = window.confirm(
      "Sigur vrei sa soliciti reprogramarea interviului?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await requestInterviewReschedule(interviewId);
      setMessage("Solicitarea de reprogramare a fost trimisa.");
      await loadApplication();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nu s-a putut solicita reprogramarea interviului."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkNoShow = async (interviewId) => {
    const confirmed = window.confirm(
      "Sigur vrei sa marchezi candidatul ca neprezentat?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await markInterviewNoShow(interviewId);
      setMessage("Interviul a fost marcat ca neprezentat.");
      await loadApplication();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nu s-a putut marca interviul ca neprezentat."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalizeInterview = async (interviewId) => {
    const confirmed = window.confirm(
      "Sigur vrei sa marchezi interviul ca finalizat?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await updateInterview(interviewId, {
        status: "FINALIZAT",
      });
      setMessage("Interviul a fost marcat ca finalizat.");
      await loadApplication();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nu s-a putut marca interviul ca finalizat."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFeedback = async ({ feedbackId, payload }) => {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      if (feedbackId) {
        await updateFeedback(feedbackId, payload);
        setMessage("Feedbackul a fost actualizat.");
      } else {
        await createFeedback(payload);
        setMessage("Feedbackul a fost salvat.");
      }

      setFeedbackInterview(null);
      await loadApplication();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut salva feedbackul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    const confirmed = window.confirm("Sigur vrei sa stergi feedbackul?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await deleteFeedback(feedbackId);
      setMessage("Feedbackul a fost sters.");
      setFeedbackInterview(null);
      await loadApplication();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut sterge feedbackul.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="page-section">
        <h1>Detalii aplicare</h1>
        <p>Se incarca detaliile aplicarii...</p>
      </section>
    );
  }

  if (error && !application) {
    return (
      <section className="page-section">
        <h1>Detalii aplicare</h1>
        <p className="error">{error}</p>
        <Link className="button-link secondary-link" to="/applications">
          Inapoi la aplicari
        </Link>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Detalii aplicare</h1>
          <p>
            {application.nume} {application.prenume} - {application.titlu_job}
          </p>
        </div>
      </div>

      <div className="detail-panel">
        {canManageApplication && (
          <div className="application-overview">
            <div>
              <span>Urmatoarea actiune recomandata</span>
              <h2>{nextActionMessage}</h2>
            </div>

            <div className="application-overview-status">
              <span className={`status-badge status-${application.status?.toLowerCase()}`}>
                {statusLabels[application.status] || application.status}
              </span>
              <strong>
                {hasScore ? `${application.scor_compatibilitate} puncte` : "Scor necalculat"}
              </strong>
              <small>Scor compatibilitate</small>
            </div>
          </div>
        )}

        {canManageApplication && (
          <div className="internal-timeline">
            {workflowSteps.map((step) => (
              <div
                className={`internal-timeline-step timeline-${step.status}`}
                key={step.title}
              >
                <span className="timeline-dot" />
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            ))}
          </div>
        )}

        <div className="detail-grid">
          <div>
            <span>Candidat</span>
            <strong>
              {application.nume} {application.prenume}
            </strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{application.email}</strong>
          </div>

          <div>
            <span>Telefon</span>
            <strong>{application.telefon || "-"}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>
              <span className={`status-badge status-${application.status?.toLowerCase()}`}>
                {statusLabels[application.status] || application.status}
              </span>
            </strong>
          </div>

          <div>
            <span>Data aplicare</span>
            <strong>
              {application.data_aplicare
                ? new Date(application.data_aplicare).toLocaleDateString()
                : "-"}
            </strong>
          </div>
        </div>

        {canManageApplication && (
          <>
            <div className="description-block">
              <h2>Rezumat AI</h2>
              {aiSummary ? (
                <>
                  <div className="ai-summary-grid">
                    <div>
                      <span>Scor compatibilitate</span>
                      <strong>
                        {formatScoreValue(
                          aiAnalysis?.final_score ??
                            aiSummary.finalHybridScore ??
                            application.scor_compatibilitate
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Recomandare</span>
                      <strong>{aiAnalysis?.recommendation || "-"}</strong>
                    </div>

                    <div>
                      <span>Potrivire dupa criteriile jobului</span>
                      <strong>
                        {formatScoreValue(aiAnalysis?.ahp_explainable_score)}
                      </strong>
                    </div>

                    <div>
                      <span>Potrivire generala cu jobul</span>
                      <strong>
                        {formatScoreValue(
                          aiAnalysis?.semantic_score ?? semanticScores?.overall
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Status analiza</span>
                      <strong>
                        {aiAnalysis?.is_partial_score
                          ? "Scor partial"
                          : "Scor complet"}
                      </strong>
                    </div>

                  </div>

                  {semanticScores ? (
                    <div className="ai-score-section">
                      <h3>Evaluare pe criterii</h3>
                      <div className="ai-summary-grid">
                        {Object.entries(semanticScores).map(([key, value]) => (
                          <div key={key}>
                            <span>{semanticScoreLabels[key] || key}</span>
                            <strong>{formatScoreValue(value)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="ai-score-section">
                      <h3>Scoruri partiale clasice</h3>
                      <div className="ai-summary-grid">
                        {Object.entries(
                          aiSummary.classicExplanation?.partialScores || {}
                        ).map(([key, value]) => (
                          <div key={key}>
                            <span>{scoreLabels[key] || key}</span>
                            <strong>{formatScoreValue(value)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detectedStrengths.length > 0 && (
                    <div className="ai-score-section">
                      <h3>Puncte forte detectate</h3>
                      <div className="ai-chip-list">
                        {detectedStrengths.map((strength) => (
                          <span className="ai-chip ai-chip-success" key={strength}>
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {incompleteSections.length > 0 && (
                    <p className="info-message">
                      Scorul poate fi partial deoarece CV-ul nu contine suficiente
                      informatii pentru: {incompleteSections.join(", ")}.
                    </p>
                  )}
                </>
              ) : (
                <p>
                  {application.rezumat_ai || "Nu exista rezumat AI disponibil."}
                </p>
              )}
            </div>

            <div className="description-block">
              <h2>Competente lipsa</h2>

              {!hasMissingSkills ? (
                <p>Nu exista competente lipsa pentru acest job.</p>
              ) : missingSkills.legacyText ? (
                <p>{missingSkills.legacyText}</p>
              ) : (
                <div className="missing-skills-grid">
                  <div>
                    <h3>Obligatorii</h3>
                    {missingSkills.obligatorii.length === 0 ? (
                      <p>Nu lipsesc competente obligatorii.</p>
                    ) : (
                      <ul>
                        {missingSkills.obligatorii.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h3>Optionale</h3>
                    {missingSkills.optionale.length === 0 ? (
                      <p>Nu lipsesc competente optionale.</p>
                    ) : (
                      <ul>
                        {missingSkills.optionale.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {isWithdrawn && (
          <p className="info-message">
            Aceasta candidatura a fost retrasa de candidat. Detaliile raman
            vizibile, dar candidatura nu mai este luata in considerare pentru
            scoring, clasament sau programarea interviurilor.
          </p>
        )}

        {canManageApplication &&
          !isWithdrawn &&
          user?.rol === "MANAGER" &&
          application.status !== "IN_ANALIZA" && (
            <p className="info-message">
              Pentru programarea interviului tehnic, candidatura trebuie sa fie in
              statusul In analiza.
            </p>
          )}

        {canScheduleInterview && (
          <div className="description-block">
            <h2>
              {user?.rol === "MANAGER"
                ? "Programeaza interviu tehnic"
                : "Programeaza interviu HR"}
            </h2>

            <form className="content-form" onSubmit={handleCreateInterview}>
              <label>
                Data si ora
                <input
                  type="datetime-local"
                  name="data_interviu"
                  value={interviewForm.data_interviu}
                  onChange={handleInterviewChange}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
                {interviewFormError && (
                  <span className="field-error">{interviewFormError}</span>
                )}
              </label>

              <label>
                Tip interviu
                <select
                  name="tip_interviu"
                  value={interviewForm.tip_interviu}
                  onChange={handleInterviewChange}
                >
                  {interviewOptions.map((type) => (
                    <option key={type} value={type}>
                      {interviewTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Link meeting sau locatie
                <input
                  name="link_meeting"
                  value={interviewForm.link_meeting}
                  onChange={handleInterviewChange}
                  placeholder="Ex: https://meet.google.com/... sau sediul companiei"
                  maxLength="500"
                />
              </label>

              <button type="submit" disabled={isSaving}>
                Programeaza interviu
              </button>
            </form>
          </div>
        )}

        {canManageApplication &&
          application.status === "IN_ANALIZA" &&
          user?.rol === "MANAGER" &&
          !hasFinalizedHrInterview && (
            <p className="info-message">
              Managerul poate programa interviul tehnic dupa finalizarea
              interviului HR.
            </p>
          )}

        {interviews.length > 0 && (
          <div className="description-block">
            <h2>Interviuri</h2>

            <div className="compact-list">
              {interviews.map((interview) => (
                <div className="compact-list-item" key={interview.id_interviu}>
                  <div>
                    <strong>
                      {interviewTypeLabels[interview.tip_interviu] ||
                        interview.tip_interviu}
                    </strong>
                    <span>
                      {formatDateTime(interview.data_interviu)}
                    </span>
                    <span>{interview.link_meeting || "-"}</span>

                    {canViewFeedback && buildFeedbackFromInterview(interview) && (
                      <div className="feedback-preview">
                        <strong>Feedback salvat</strong>
                        <FeedbackDetails
                          feedback={buildFeedbackFromInterview(interview)}
                        />
                      </div>
                    )}
                  </div>

                  <span className={`status-badge status-${interview.status?.toLowerCase()}`}>
                    {interviewStatusLabels[interview.status] ||
                      interview.status}
                  </span>

                  {user?.rol === "CANDIDAT" &&
                    interview.status === "PROGRAMAT" && (
                      <div className="table-actions">
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            handleCancelInterview(interview.id_interviu)
                          }
                          disabled={isSaving}
                        >
                          Anuleaza
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleRequestReschedule(interview.id_interviu)
                          }
                          disabled={isSaving}
                        >
                          Reprogramare
                        </button>
                      </div>
                    )}

                  {canManageInterviewStage(interview) &&
                    interview.status === "PROGRAMAT" && (
                    <div className="table-actions">
                      <button
                        type="button"
                        onClick={() =>
                          handleFinalizeInterview(interview.id_interviu)
                        }
                        disabled={isSaving}
                      >
                        Marcheaza finalizat
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleMarkNoShow(interview.id_interviu)}
                        disabled={isSaving}
                      >
                        Neprezentat
                      </button>
                    </div>
                  )}

                  {canManageInterviewStage(interview) &&
                    ["PROGRAMAT", "REPROGRAMARE_SOLICITATA"].includes(
                      interview.status
                    ) && (
                      <div className="table-actions">
                        <button
                          type="button"
                          onClick={() => startEditingInterview(interview)}
                          disabled={isSaving}
                        >
                          Reprogrameaza
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            handleCancelManagedInterview(interview.id_interviu)
                          }
                          disabled={isSaving}
                        >
                          Anuleaza interviul
                        </button>
                      </div>
                    )}

                  {canManageFeedbackForInterview(interview) && (
                    <div className="table-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setFeedbackInterview(interview)}
                        disabled={isSaving}
                      >
                        {buildFeedbackFromInterview(interview)
                          ? "Editeaza feedback"
                          : "Adauga feedback"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {canManageApplication && (
          <div className="description-block">
            <div className="decision-header">
              <div>
                <h2>Evaluare si decizie</h2>
                <p>{decisionMessage}</p>
              </div>

              <span
                className={`status-badge status-${application.status?.toLowerCase()}`}
              >
                {statusLabels[application.status] || application.status}
              </span>
            </div>

            <div className="decision-grid">
              <div className={`decision-card decision-${scoreStatus.tone}`}>
                <span>Scor compatibilitate</span>
                <strong>{scoreStatus.label}</strong>
                <p>{scoreStatus.description}</p>
              </div>

              <div className={`decision-card decision-${hrEvaluationStatus.tone}`}>
                <span>Etapa HR</span>
                <strong>{hrEvaluationStatus.label}</strong>
                <p>{hrEvaluationStatus.description}</p>
              </div>

              <div
                className={`decision-card decision-${technicalEvaluationStatus.tone}`}
              >
                <span>Etapa tehnica</span>
                <strong>{technicalEvaluationStatus.label}</strong>
                <p>{technicalEvaluationStatus.description}</p>
              </div>
            </div>

            {(hrFeedback || technicalFeedback) && (
              <div className="decision-feedback-grid">
                {hrFeedback && (
                  <div>
                    <span>Recomandare HR</span>
                    <strong>
                      {feedbackRecommendationLabels[
                        hrFeedback.recomandare_finala
                      ] ||
                        hrFeedback.recomandare_finala ||
                        "-"}
                    </strong>
                  </div>
                )}

                {technicalFeedback && (
                  <div>
                    <span>Recomandare tehnica</span>
                    <strong>
                      {feedbackRecommendationLabels[
                        technicalFeedback.recomandare_finala
                      ] ||
                        technicalFeedback.recomandare_finala ||
                        "-"}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {!isWithdrawn && !isFinalDecision && (
              <div className="decision-actions">
                <button
                  type="button"
                  className="success-button"
                  onClick={() => handleDecisionStatusUpdate("ACCEPTATA")}
                  disabled={isSaving || application.status === "ACCEPTATA"}
                >
                  Accepta candidatura
                </button>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDecisionStatusUpdate("RESPINSA")}
                  disabled={isSaving || application.status === "RESPINSA"}
                >
                  Respinge candidatura
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleDecisionStatusUpdate("IN_ANALIZA")}
                  disabled={isSaving || application.status === "IN_ANALIZA"}
                >
                  Pastreaza in analiza
                </button>
              </div>
            )}
          </div>
        )}

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <div className="detail-actions">
          {canManageApplication && (
            <select
              className="status-update-select"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              disabled={isSaving || isWithdrawn || isFinalDecision}
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                  disabled={status === "RETRASA" && !isWithdrawn}
                >
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          )}

          {application.id_cv && (
            <>
              <button type="button" onClick={handlePreviewCv} disabled={isSaving}>
                Previzualizeaza CV
              </button>

              <button type="button" onClick={handleDownloadCv} disabled={isSaving}>
                Descarca CV
              </button>
            </>
          )}

          {canManageApplication && (
            <button
              type="button"
              onClick={handleCalculateScore}
              disabled={isSaving || isWithdrawn}
            >
              Calculeaza scor
            </button>
          )}

          {canManageApplication && (
            <button
              type="button"
              className="status-update-button"
              onClick={handleStatusUpdate}
              disabled={
                isSaving ||
                isWithdrawn ||
                isFinalDecision ||
                selectedStatus === application.status
              }
            >
              Actualizeaza status
            </button>
          )}

          <Link
            className="button-link secondary-link"
            to={user?.rol === "CANDIDAT" ? "/my-applications" : "/applications"}
          >
            Inapoi la aplicari
          </Link>
        </div>
      </div>

      {editingInterviewId && (
        <div className="modal-overlay" role="presentation">
          <form
            className="modal-panel"
            onSubmit={handleUpdateInterviewSchedule}
          >
            <div className="modal-header">
              <div>
                <h2>Reprogrameaza interviul</h2>
                <p>Alege noua data, tipul interviului si linkul sau locatia.</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={cancelEditingInterview}
                disabled={isSaving}
                aria-label="Inchide"
              >
                x
              </button>
            </div>

            <label>
              Data si ora
              <input
                type="datetime-local"
                name="data_interviu"
                value={editInterviewForm.data_interviu}
                onChange={handleEditInterviewChange}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
              {editInterviewFormError && (
                <span className="field-error">{editInterviewFormError}</span>
              )}
            </label>

            <label>
              Tip interviu
              <select
                name="tip_interviu"
                value={editInterviewForm.tip_interviu}
                onChange={handleEditInterviewChange}
                required
              >
                {interviewOptions.map((type) => (
                  <option key={type} value={type}>
                    {interviewTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Link meeting sau locatie
              <input
                name="link_meeting"
                value={editInterviewForm.link_meeting}
                onChange={handleEditInterviewChange}
                placeholder="Ex: https://meet.google.com/... sau sediul companiei"
                maxLength="500"
              />
            </label>

            <div className="form-actions">
              <button type="submit" disabled={isSaving}>
                Salveaza reprogramarea
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={cancelEditingInterview}
                disabled={isSaving}
              >
                Anuleaza
              </button>
            </div>
          </form>
        </div>
      )}

      {cvPreviewUrl && (
        <div className="modal-overlay cv-preview-overlay" role="presentation">
          <div className="modal-panel cv-preview-modal">
            <div className="modal-header">
              <div>
                <h2>Previzualizare CV</h2>
                <p>{application.nume_fisier || "CV candidat"}</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={handleCloseCvPreview}
                aria-label="Inchide previzualizarea CV-ului"
              >
                x
              </button>
            </div>

            <iframe
              className="cv-preview-frame"
              src={cvPreviewUrl}
              title="Previzualizare CV"
            />
          </div>
        </div>
      )}

      {feedbackInterview && (
        <FeedbackModal
          interview={feedbackInterview}
          candidateName={`${application.prenume || ""} ${
            application.nume || ""
          }`.trim()}
          jobTitle={application.titlu_job}
          interviewerName={`${
            feedbackInterview.organizator_prenume || ""
          } ${feedbackInterview.organizator_nume || ""}`.trim()}
          interviewTypeLabel={
            interviewTypeLabels[feedbackInterview.tip_interviu] ||
            feedbackInterview.tip_interviu
          }
          formatDateTime={formatDateTime}
          onClose={() => setFeedbackInterview(null)}
          onSubmit={handleSaveFeedback}
          onDelete={handleDeleteFeedback}
          isSaving={isSaving}
        />
      )}
    </section>
  );
}

export default ApplicationDetailPage;
