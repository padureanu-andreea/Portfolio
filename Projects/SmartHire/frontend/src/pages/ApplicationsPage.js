import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getJobs } from "../services/jobService";
import {
  getJobApplications,
  updateApplicationStatus,
} from "../services/applicationService";
import { calculateMissingScoresForJob } from "../services/scoringService";

const statuses = ["DEPUSA", "IN_ANALIZA", "ACCEPTATA", "RESPINSA", "RETRASA"];

const statusLabels = {
  DEPUSA: "Depusa",
  IN_ANALIZA: "In analiza",
  ACCEPTATA: "Acceptata",
  RESPINSA: "Respinsa",
  RETRASA: "Retrasa",
};

const applicationFilterStatuses = [
  { value: "", label: "Toate" },
  { value: "ACTIVE", label: "Active" },
  { value: "DEPUSA", label: "Depuse" },
  { value: "IN_ANALIZA", label: "In analiza" },
  { value: "TECH_REQUIRED", label: "Necesita interviu tehnic" },
  { value: "TECH_PROGRAMMED", label: "Interviu tehnic programat" },
  { value: "ACCEPTATA", label: "Acceptate" },
  { value: "RESPINSA", label: "Respinse" },
  { value: "RETRASA", label: "Retrase" },
  { value: "WITH_SCORE", label: "Cu scor" },
  { value: "WITHOUT_SCORE", label: "Fara scor" },
];

const getApplicationActionTags = (application) => {
  const tags = [];
  const hasScore =
    application.scor_compatibilitate !== null &&
    application.scor_compatibilitate !== undefined;
  const isClosed =
    application.status === "RESPINSA" ||
    application.status === "RETRASA" ||
    application.status === "ACCEPTATA";

  if (application.status === "RETRASA") {
    return [{ label: "Candidatura retrasa", tone: "danger" }];
  }

  if (application.status === "RESPINSA") {
    return [{ label: "Proces inchis", tone: "danger" }];
  }

  if (application.status === "ACCEPTATA") {
    return [{ label: "Candidat acceptat", tone: "success" }];
  }

  if (!hasScore) {
    tags.push({ label: "Necesita scor", tone: "warning" });
  }

  if (application.status === "DEPUSA") {
    tags.push({ label: "Necesita analiza initiala", tone: "info" });
  }

  if (
    application.status === "IN_ANALIZA" &&
    application.has_hr_finalized &&
    !application.has_technical_interview
  ) {
    tags.push({ label: "Pregatit pentru tehnic", tone: "success" });
  }

  if (
    application.status === "IN_ANALIZA" &&
    application.has_active_technical_interview
  ) {
    tags.push({ label: "Interviu tehnic programat", tone: "info" });
  }

  if (application.status === "IN_ANALIZA" && hasScore && !isClosed) {
    tags.push({ label: "Asteapta decizie", tone: "warning" });
  }

  if (tags.length === 0) {
    tags.push({ label: "Fara actiuni urgente", tone: "neutral" });
  }

  return tags;
};

const getScoreLabel = (score) => {
  if (score === null || score === undefined) {
    return "Necalculat";
  }

  return Number(score).toFixed(2);
};

const getScoreClass = (score) => {
  if (score === null || score === undefined) {
    return "score-empty";
  }

  if (Number(score) >= 80) {
    return "score-high";
  }

  if (Number(score) >= 60) {
    return "score-medium";
  }

  return "score-low";
};

function ApplicationsPage() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sort: "date_desc",
  });

  const canAccess =
    user?.rol === "RECRUTOR" || user?.rol === "MANAGER" || user?.rol === "ADMIN";

  const reloadApplications = useCallback(async () => {
    const applicationsByJob = await Promise.all(
      jobs.map((job) =>
        getJobApplications(job.id_job).then((jobApplications) =>
          jobApplications.map((application) => ({
            ...application,
            id_job: job.id_job,
            titlu_job: job.titlu_job,
          }))
        )
      )
    );

    setApplications(applicationsByJob.flat());
  }, [jobs]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (err) {
        setError(err.response?.data?.message || "Nu s-au putut incarca joburile.");
      } finally {
        setIsLoadingJobs(false);
      }
    };

    if (canAccess) {
      loadJobs();
    }
  }, [canAccess]);

  useEffect(() => {
    const loadApplications = async () => {
      if (jobs.length === 0) {
        setApplications([]);
        return;
      }

      setIsLoadingApplications(true);
      setError("");

      try {
        await reloadApplications();
      } catch (err) {
        setError(err.response?.data?.message || "Nu s-au putut incarca aplicarile.");
      } finally {
        setIsLoadingApplications(false);
      }
    };

    loadApplications();
  }, [jobs, reloadApplications]);

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleStatusChange = async (applicationId, status) => {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await updateApplicationStatus(applicationId, status);
      setMessage("Statusul aplicarii a fost actualizat.");

      await reloadApplications();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut actualiza statusul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCalculateMissingScores = async () => {
    if (!selectedJobId) {
      setError("Alege un job pentru calcularea scorurilor lipsa.");
      return;
    }

    const selectedJob = jobs.find(
      (job) => Number(job.id_job) === Number(selectedJobId)
    );

    const confirmed = window.confirm(
      `Vrei sa calculezi scorurile lipsa pentru jobul "${
        selectedJob?.titlu_job || "selectat"
      }"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const result = await calculateMissingScoresForJob(selectedJobId);
      const failedCount = result.failed?.length || 0;

      setMessage(
        failedCount > 0
          ? `${result.calculated?.length || 0} scoruri calculate. ${failedCount} candidaturi nu au putut fi evaluate.`
          : result.message || "Scorurile lipsa au fost calculate."
      );

      await reloadApplications();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nu s-au putut calcula scorurile lipsa."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const filteredApplications = applications
    .filter((application) => {
      const candidateText = `${application.nume || ""} ${
        application.prenume || ""
      } ${application.email || ""}`.toLowerCase();

      const matchesSearch =
        !filters.search ||
        candidateText.includes(filters.search.trim().toLowerCase());

      const matchesJob =
        !selectedJobId || Number(application.id_job) === Number(selectedJobId);

      const hasScore =
        application.scor_compatibilitate !== null &&
        application.scor_compatibilitate !== undefined;

      const isActive =
        application.status !== "RETRASA" &&
        application.status !== "RESPINSA";

      let matchesStatus = true;

      if (filters.status === "ACTIVE") {
        matchesStatus = isActive;
      } else if (filters.status === "TECH_REQUIRED") {
        matchesStatus =
          application.status === "IN_ANALIZA" &&
          application.has_hr_finalized &&
          !application.has_technical_interview;
      } else if (filters.status === "TECH_PROGRAMMED") {
        matchesStatus =
          application.status === "IN_ANALIZA" &&
          application.has_active_technical_interview;
      } else if (filters.status === "WITH_SCORE") {
        matchesStatus = hasScore;
      } else if (filters.status === "WITHOUT_SCORE") {
        matchesStatus = !hasScore;
      } else if (filters.status) {
        matchesStatus = application.status === filters.status;
      }

      return matchesSearch && matchesJob && matchesStatus;
    })
    .sort((firstApplication, secondApplication) => {
      if (filters.sort === "score_desc") {
        return (
          Number(secondApplication.scor_compatibilitate || -1) -
          Number(firstApplication.scor_compatibilitate || -1)
        );
      }

      if (filters.sort === "score_asc") {
        return (
          Number(firstApplication.scor_compatibilitate || 999) -
          Number(secondApplication.scor_compatibilitate || 999)
        );
      }

      if (filters.sort === "name") {
        return `${firstApplication.nume || ""} ${firstApplication.prenume || ""}`
          .localeCompare(
            `${secondApplication.nume || ""} ${secondApplication.prenume || ""}`
          );
      }

      return (
        new Date(secondApplication.data_aplicare || 0) -
        new Date(firstApplication.data_aplicare || 0)
      );
    });

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Aplicari</h1>
          <p>Vezi candidaturile primite pentru joburile disponibile rolului tau.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {isLoadingJobs ? (
        <p>Se incarca joburile...</p>
      ) : jobs.length === 0 ? (
        <p>Nu exista joburi disponibile.</p>
      ) : (
        <>
          <form className="content-form">
            <label>
              Job
              <select
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
              >
                <option value="">Toate joburile</option>
                {jobs.map((job) => (
                  <option key={job.id_job} value={job.id_job}>
                    {job.titlu_job}
                  </option>
                ))}
              </select>
            </label>

            {selectedJobId && (
              <div className="form-actions inline-actions">
                <button
                  type="button"
                  onClick={handleCalculateMissingScores}
                  disabled={isSaving}
                >
                  Calculeaza scorurile lipsa
                </button>

                <Link className="button-link secondary-link" to={`/jobs/${selectedJobId}`}>
                  Vezi jobul
                </Link>
              </div>
            )}
          </form>

          <div className="table-section">
            {isLoadingApplications ? (
              <p>Se incarca aplicarile...</p>
            ) : applications.length === 0 ? (
              <p>Nu exista aplicari pentru joburile disponibile.</p>
            ) : (
              <>
              <form className="filter-panel compact-filter">
                <label>
                  Cauta candidat
                  <input
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Nume sau email"
                  />
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

                <label>
                  Sortare
                  <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                  >
                    <option value="date_desc">Cele mai recente</option>
                    <option value="score_desc">Scor descrescator</option>
                    <option value="score_asc">Scor crescator</option>
                    <option value="name">Nume candidat A-Z</option>
                  </select>
                </label>
              </form>

              <p className="table-count">
                {filteredApplications.length} candidaturi afisate din{" "}
                {applications.length}
              </p>

              {filteredApplications.length === 0 ? (
                <p>Nu exista candidaturi care respecta filtrele selectate.</p>
              ) : (
              <div className="staff-application-list">
                {filteredApplications.map((application) => {
                  const isWithdrawn = application.status === "RETRASA";
                  const actionTags = getApplicationActionTags(application);

                  return (
                    <article
                      className={`staff-application-card ${
                        isWithdrawn ? "muted-card" : ""
                      }`}
                      key={application.id_aplicatie}
                    >
                      <div className="staff-application-header">
                        <div>
                          <h2>
                            {application.prenume} {application.nume}
                          </h2>
                          <p>{application.titlu_job || "-"}</p>
                        </div>

                        <span className={`status-badge status-${application.status?.toLowerCase()}`}>
                          {statusLabels[application.status] || application.status}
                        </span>
                      </div>

                      <div className="staff-application-meta">
                        <div>
                          <span>Email</span>
                          <strong>{application.email}</strong>
                        </div>

                        <div>
                          <span>Telefon</span>
                          <strong>{application.telefon || "-"}</strong>
                        </div>

                        <div>
                          <span>Data aplicare</span>
                          <strong>
                            {application.data_aplicare
                              ? new Date(application.data_aplicare).toLocaleDateString("ro-RO")
                              : "-"}
                          </strong>
                        </div>

                        <div>
                          <span>Scor</span>
                          <strong>
                            <span
                              className={`score-pill ${getScoreClass(
                                application.scor_compatibilitate
                              )}`}
                            >
                              {getScoreLabel(application.scor_compatibilitate)}
                            </span>
                          </strong>
                        </div>
                      </div>

                      <div className="application-action-tags">
                        {actionTags.map((tag) => (
                          <span
                            key={tag.label}
                            className={`action-tag action-tag-${tag.tone}`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>

                      <div className="card-actions">
                        <Link
                          className="button-link secondary-link"
                          to={`/applications/${application.id_aplicatie}`}
                        >
                          Vezi detalii
                        </Link>

                        <label className="inline-status-control">
                          Actualizare status
                          <select
                            className="status-update-select table-status-select"
                            value={application.status}
                            disabled={isSaving || isWithdrawn}
                            onChange={(event) =>
                              handleStatusChange(
                                application.id_aplicatie,
                                event.target.value
                              )
                            }
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
                        </label>
                      </div>
                    </article>
                  );
                })}
              </div>
              )}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default ApplicationsPage;
