import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyApplications,
  withdrawApplication,
} from "../services/applicationService";
import { getMyInterviews } from "../services/interviewService";

const statusLabels = {
  DEPUSA: "Depusa",
  IN_ANALIZA: "In analiza",
  ACCEPTATA: "Acceptata",
  RESPINSA: "Respinsa",
  RETRASA: "Retrasa",
};

const applicationFilterStatuses = [
  { value: "", label: "Toate statusurile" },
  { value: "ACTIVE", label: "Active" },
  { value: "DEPUSA", label: "Depuse" },
  { value: "IN_ANALIZA", label: "In analiza" },
  { value: "ACCEPTATA", label: "Acceptate" },
  { value: "RESPINSA", label: "Respinse" },
  { value: "RETRASA", label: "Retrase" },
];

const hrInterviewTypes = ["HR_ONLINE", "HR_FIZIC", "HR_TELEFONIC"];
const technicalInterviewTypes = ["TEHNIC_ONLINE", "TEHNIC_FIZIC"];

const interviewStatusLabels = {
  PROGRAMAT: "Programat",
  FINALIZAT: "Finalizat",
  ANULAT: "Anulat",
  REPROGRAMARE_SOLICITATA: "Reprogramare solicitata",
  NEPREZENTAT: "Neprezentat",
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("ro-RO");
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

const getInterviewByStage = (interviews, stageTypes) => {
  return interviews
    .filter((interview) => stageTypes.includes(interview.tip_interviu))
    .sort(
      (firstInterview, secondInterview) =>
        new Date(secondInterview.data_interviu || 0) -
        new Date(firstInterview.data_interviu || 0)
    )[0];
};

const getInterviewTimelineStep = ({ label, interview }) => {
  if (!interview) {
    return {
      label,
      state: "upcoming",
      title: "Urmeaza",
      description: "Nu exista inca un interviu programat pentru aceasta etapa.",
    };
  }

  if (interview.status === "FINALIZAT") {
    return {
      label,
      state: "done",
      title: "Finalizat",
      description: formatDateTime(interview.data_interviu),
    };
  }

  if (
    interview.status === "PROGRAMAT" ||
    interview.status === "REPROGRAMARE_SOLICITATA"
  ) {
    return {
      label,
      state: "current",
      title: interviewStatusLabels[interview.status] || interview.status,
      description: formatDateTime(interview.data_interviu),
    };
  }

  if (interview.status === "ANULAT" || interview.status === "NEPREZENTAT") {
    return {
      label,
      state: "stopped",
      title: interviewStatusLabels[interview.status] || interview.status,
      description: formatDateTime(interview.data_interviu),
    };
  }

  return {
    label,
    state: "upcoming",
    title: interviewStatusLabels[interview.status] || interview.status,
    description: formatDateTime(interview.data_interviu),
  };
};

const buildApplicationTimeline = (application, interviews) => {
  const hrInterview = getInterviewByStage(interviews, hrInterviewTypes);
  const technicalInterview = getInterviewByStage(
    interviews,
    technicalInterviewTypes
  );
  const isWithdrawn = application.status === "RETRASA";
  const isRejected = application.status === "RESPINSA";
  const isAccepted = application.status === "ACCEPTATA";
  const isInAnalysis =
    application.status === "IN_ANALIZA" || isAccepted || isRejected;

  return [
    {
      label: "Candidatura depusa",
      state: "done",
      title: "Depusa",
      description: formatDate(application.data_aplicare),
    },
    {
      label: "Analiza candidaturii",
      state: isWithdrawn
        ? "stopped"
        : isInAnalysis
          ? "done"
          : "current",
      title: isWithdrawn
        ? "Retrasa"
        : isInAnalysis
          ? "In analiza"
          : "Asteapta evaluarea",
      description: isWithdrawn
        ? "Procesul a fost oprit la cererea candidatului."
        : "Echipa de recrutare verifica aplicarea.",
    },
    getInterviewTimelineStep({
      label: "Interviu HR",
      interview: hrInterview,
    }),
    getInterviewTimelineStep({
      label: "Interviu tehnic",
      interview: technicalInterview,
    }),
    {
      label: "Decizie finala",
      state: isAccepted
        ? "done"
        : isRejected || isWithdrawn
          ? "stopped"
          : "upcoming",
      title: isAccepted
        ? "Acceptata"
        : isRejected
          ? "Respinsa"
          : isWithdrawn
            ? "Retrasa"
            : "In asteptare",
      description: isAccepted
        ? "Candidatura a fost acceptata."
        : isRejected
          ? "Procesul nu continua cu aceasta candidatura."
          : isWithdrawn
            ? "Candidatura a fost retrasa."
            : "Decizia finala nu a fost luata inca.",
    },
  ];
};

const getNextStepText = (application, timeline) => {
  if (application.status === "ACCEPTATA") {
    return "Candidatura ta a fost acceptata.";
  }

  if (application.status === "RESPINSA") {
    return "Procesul nu continua cu aceasta candidatura.";
  }

  if (application.status === "RETRASA") {
    return "Candidatura a fost retrasa.";
  }

  const currentStep = timeline.find((step) => step.state === "current");

  if (currentStep) {
    return `${currentStep.label}: ${currentStep.title}.`;
  }

  return "Asteapta urmatoarea actualizare din partea echipei de recrutare.";
};

function MyApplicationsPage() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    jobId: "",
  });

  const loadApplications = async () => {
    try {
      setError("");
      const [applicationsData, interviewsData] = await Promise.all([
        getMyApplications(),
        getMyInterviews(),
      ]);

      setApplications(applicationsData);
      setInterviews(interviewsData);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-au putut incarca aplicarile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  if (user?.rol !== "CANDIDAT") {
    return <Navigate to="/dashboard" replace />;
  }

  const canWithdraw = (status) => {
    return status !== "ACCEPTATA" && status !== "RESPINSA" && status !== "RETRASA";
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const filteredApplications = applications.filter((application) => {
    const matchesJob =
      !filters.jobId || Number(application.id_job) === Number(filters.jobId);

    if (filters.status === "ACTIVE") {
      return (
        matchesJob &&
        application.status !== "RESPINSA" &&
        application.status !== "RETRASA"
      );
    }

    if (filters.status) {
      return matchesJob && application.status === filters.status;
    }

    return matchesJob;
  });

  const interviewsByApplicationId = interviews.reduce(
    (groupedInterviews, interview) => {
      const key = String(interview.id_aplicatie);

      if (!groupedInterviews[key]) {
        groupedInterviews[key] = [];
      }

      groupedInterviews[key].push(interview);

      return groupedInterviews;
    },
    {}
  );

  const appliedJobs = applications.reduce((uniqueJobs, application) => {
    if (
      application.id_job &&
      !uniqueJobs.some((job) => Number(job.id_job) === Number(application.id_job))
    ) {
      uniqueJobs.push({
        id_job: application.id_job,
        titlu_job: application.titlu_job,
      });
    }

    return uniqueJobs;
  }, []);

  const handleWithdraw = async (applicationId) => {
    const confirmed = window.confirm("Sigur vrei sa retragi aceasta candidatura?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await withdrawApplication(applicationId);
      setMessage("Candidatura a fost retrasa cu succes.");
      await loadApplications();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut retrage candidatura.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Aplicarile mele</h1>
          <p>Urmareste joburile la care ai aplicat.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="table-section">
        {isLoading ? (
          <p>Se incarca aplicarile...</p>
        ) : applications.length === 0 ? (
          <p>Nu ai aplicat la niciun job inca.</p>
        ) : (
          <>
          <form className="filter-panel compact-filter">
            <label>
              Job
              <select
                name="jobId"
                value={filters.jobId}
                onChange={handleFilterChange}
              >
                <option value="">Toate joburile</option>
                {appliedJobs.map((job) => (
                  <option key={job.id_job} value={job.id_job}>
                    {job.titlu_job}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                {applicationFilterStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
          </form>

          <p className="table-count">
            {filteredApplications.length} aplicari afisate din{" "}
            {applications.length}
          </p>

          {filteredApplications.length === 0 ? (
            <p>Nu exista aplicari care respecta filtrul selectat.</p>
          ) : (
          <div className="application-card-list">
            {filteredApplications.map((application) => {
              const applicationInterviews =
                interviewsByApplicationId[String(application.id_aplicatie)] || [];
              const timeline = buildApplicationTimeline(
                application,
                applicationInterviews
              );

              return (
                <article
                  className="application-card"
                  key={application.id_aplicatie}
                >
                  <div className="application-card-header">
                    <div>
                      <h2>{application.titlu_job}</h2>
                      <p>Aplicat la {formatDate(application.data_aplicare)}</p>
                    </div>

                    <span
                      className={`status-badge status-${application.status?.toLowerCase()}`}
                    >
                      {statusLabels[application.status] || application.status}
                    </span>
                  </div>

                  <p className="next-step-text">
                    {getNextStepText(application, timeline)}
                  </p>

                  <div className="application-timeline">
                    {timeline.map((step) => (
                      <div
                        className={`timeline-step timeline-${step.state}`}
                        key={step.label}
                      >
                        <span className="timeline-dot" />
                        <div>
                          <strong>{step.label}</strong>
                          <span>{step.title}</span>
                          <p>{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card-actions">
                    <Link
                      className="button-link secondary-link"
                      to={`/applications/${application.id_aplicatie}`}
                    >
                      Vezi detalii
                    </Link>

                    {canWithdraw(application.status) && (
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleWithdraw(application.id_aplicatie)}
                        disabled={isSaving}
                      >
                        Retrage candidatura
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          )}
          </>
        )}
      </div>
    </section>
  );
}

export default MyApplicationsPage;
