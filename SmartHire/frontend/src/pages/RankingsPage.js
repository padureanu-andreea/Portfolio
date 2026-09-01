import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApplicationDetails } from "../services/applicationService";
import {
  createFeedback,
  updateFeedback,
} from "../services/feedbackService";
import { getJobs } from "../services/jobService";
import {
  getApplicationAnalysis,
  getJobRanking,
} from "../services/rankingService";
import FeedbackModal, {
  buildFeedbackFromInterview,
  FeedbackDetails,
} from "../components/FeedbackModal";

const statusLabels = {
  DEPUSA: "Depusa",
  IN_ANALIZA: "In analiza",
  ACCEPTATA: "Acceptata",
  RESPINSA: "Respinsa",
  RETRASA: "Retrasa",
};

const scoreLabels = {
  hard_skills_score: "Competente tehnice",
  soft_skills_score: "Competente soft",
  experience_score: "Experienta",
  projects_score: "Proiecte",
  education_score: "Educatie",
  volunteering_score: "Voluntariat",
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
const feedbackInterviewStatuses = ["FINALIZAT", "NEPREZENTAT"];

const parseJsonValue = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const parseMissingSkills = (value) => {
  const parsed = parseJsonValue(value);

  if (!parsed) {
    return {
      obligatorii: [],
      optionale: [],
      legacyText: value || "",
    };
  }

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
};

const getScoreTone = (score) => {
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

const formatScore = (score) => {
  if (score === null || score === undefined) {
    return "Necalculat";
  }

  return Number(score).toFixed(2);
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

const getRecommendation = (application) => {
  const parsedSummary = parseJsonValue(application.rezumat_ai);

  return (
    parsedSummary?.aiAnalysis?.recommendation ||
    parsedSummary?.aiAnalysis?.recommendare ||
    parsedSummary?.recommendation ||
    "-"
  );
};

function RankingsPage() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [ranking, setRanking] = useState([]);
  const [jobInfo, setJobInfo] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    scoreRange: "",
    sort: "score_desc",
  });
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedApplicationDetails, setSelectedApplicationDetails] =
    useState(null);
  const [feedbackInterview, setFeedbackInterview] = useState(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState("");
  const [analysisError, setAnalysisError] = useState("");

  const canAccess =
    user?.rol === "RECRUTOR" || user?.rol === "MANAGER" || user?.rol === "ADMIN";
  const canViewFeedback =
    user?.rol === "RECRUTOR" || user?.rol === "MANAGER";
  const canManageFeedbackForInterview = (interview) => {
    if (!feedbackInterviewStatuses.includes(interview.status)) {
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

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);

        if (data.length > 0) {
          setSelectedJobId(String(data[0].id_job));
        }
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
    const loadRanking = async () => {
      if (!selectedJobId) {
        setRanking([]);
        setJobInfo(null);
        return;
      }

      setIsLoadingRanking(true);
      setError("");
      setSelectedAnalysis(null);
      setSelectedApplicationDetails(null);

      try {
        const data = await getJobRanking(selectedJobId);
        setRanking(data.ranking || []);
        setJobInfo(data.job || null);
      } catch (err) {
        setError(err.response?.data?.message || "Nu s-a putut incarca clasamentul.");
      } finally {
        setIsLoadingRanking(false);
      }
    };

    loadRanking();
  }, [selectedJobId]);

  const visibleRanking = useMemo(() => {
    return ranking
      .filter((application) => {
        if (
          application.status === "RETRASA" ||
          application.status === "RESPINSA"
        ) {
          return false;
        }

        const candidateText = `${application.nume || ""} ${
          application.prenume || ""
        } ${application.email || ""}`.toLowerCase();
        const matchesSearch =
          !filters.search ||
          candidateText.includes(filters.search.trim().toLowerCase());

        const matchesStatus =
          !filters.status || application.status === filters.status;

        const score = Number(application.scor_compatibilitate);
        const hasScore =
          application.scor_compatibilitate !== null &&
          application.scor_compatibilitate !== undefined;

        let matchesScoreRange = true;

        if (filters.scoreRange === "without_score") {
          matchesScoreRange = !hasScore;
        } else if (filters.scoreRange === "high") {
          matchesScoreRange = hasScore && score >= 80;
        } else if (filters.scoreRange === "medium") {
          matchesScoreRange = hasScore && score >= 60 && score < 80;
        } else if (filters.scoreRange === "low") {
          matchesScoreRange = hasScore && score < 60;
        }

        return matchesSearch && matchesStatus && matchesScoreRange;
      })
      .sort((firstApplication, secondApplication) => {
        if (filters.sort === "score_asc") {
          return (
            Number(firstApplication.scor_compatibilitate ?? 999) -
            Number(secondApplication.scor_compatibilitate ?? 999)
          );
        }

        if (filters.sort === "date_desc") {
          return (
            new Date(secondApplication.data_aplicare || 0) -
            new Date(firstApplication.data_aplicare || 0)
          );
        }

        if (filters.sort === "date_asc") {
          return (
            new Date(firstApplication.data_aplicare || 0) -
            new Date(secondApplication.data_aplicare || 0)
          );
        }

        return (
          Number(secondApplication.scor_compatibilitate ?? -1) -
          Number(firstApplication.scor_compatibilitate ?? -1)
        );
      });
  }, [ranking, filters]);

  const stats = useMemo(() => {
    const scoredApplications = visibleRanking.filter(
      (application) =>
        application.scor_compatibilitate !== null &&
        application.scor_compatibilitate !== undefined
    );
    const scores = scoredApplications.map((application) =>
      Number(application.scor_compatibilitate)
    );
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : null;
    const bestScore = scores.length > 0 ? Math.max(...scores) : null;

    return {
      total: visibleRanking.length,
      scored: scoredApplications.length,
      withoutScore: visibleRanking.length - scoredApplications.length,
      averageScore,
      bestScore,
    };
  }, [visibleRanking]);

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const handleOpenAnalysis = async (applicationId) => {
    setSelectedAnalysis(null);
    setSelectedApplicationDetails(null);
    setAnalysisError("");
    setIsLoadingAnalysis(true);

    try {
      const [analysisData, applicationData] = await Promise.all([
        getApplicationAnalysis(applicationId),
        getApplicationDetails(applicationId),
      ]);

      setSelectedAnalysis(analysisData);
      setSelectedApplicationDetails(applicationData);
    } catch (err) {
      setAnalysisError(
        err.response?.data?.message || "Nu s-a putut incarca analiza aplicarii."
      );
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const closeAnalysisPanel = () => {
    setSelectedAnalysis(null);
    setSelectedApplicationDetails(null);
    setAnalysisError("");
    setIsLoadingAnalysis(false);
    setFeedbackInterview(null);
  };

  const handleSaveFeedback = async ({ feedbackId, payload }) => {
    setAnalysisError("");
    setIsLoadingAnalysis(true);

    try {
      if (feedbackId) {
        await updateFeedback(feedbackId, payload);
      } else {
        await createFeedback(payload);
      }

      const applicationData = await getApplicationDetails(
        selectedAnalysis.application.id_aplicatie
      );

      setSelectedApplicationDetails(applicationData);
      setFeedbackInterview(null);
    } catch (err) {
      setAnalysisError(
        err.response?.data?.message || "Nu s-a putut salva feedbackul."
      );
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const selectedMissingSkills = parseMissingSkills(
    selectedAnalysis?.competente_lipsa
  );
  const explanation =
    selectedAnalysis?.explanation && typeof selectedAnalysis.explanation === "object"
      ? selectedAnalysis.explanation
      : null;
  const aiAnalysis = explanation?.aiAnalysis || null;
  const semanticScores = aiAnalysis?.semantic_scores || null;
  const detectedStrengths = Array.isArray(aiAnalysis?.detected_strengths)
    ? aiAnalysis.detected_strengths
    : [];
  const incompleteSections = Array.isArray(aiAnalysis?.incomplete_sections)
    ? aiAnalysis.incomplete_sections
    : [];
  const scoreEntries = selectedAnalysis?.scores
    ? Object.entries(selectedAnalysis.scores).filter(
        ([key]) => key !== "scor_compatibilitate"
      )
    : [];

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Clasamente</h1>
          <p>
            Compara aplicantii activi pentru un job si vezi rapid scorurile,
            recomandarile AI si competentele lipsa.
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {isLoadingJobs ? (
        <p>Se incarca joburile...</p>
      ) : jobs.length === 0 ? (
        <p>Nu exista joburi disponibile pentru rolul tau.</p>
      ) : (
        <>
          <form className="filter-panel">
            <label>
              Job
              <select
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
              >
                {jobs.map((job) => (
                  <option key={job.id_job} value={job.id_job}>
                    {job.titlu_job}
                  </option>
                ))}
              </select>
            </label>

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
                <option value="">Toate statusurile active</option>
                <option value="DEPUSA">Depuse</option>
                <option value="IN_ANALIZA">In analiza</option>
                <option value="ACCEPTATA">Acceptate</option>
              </select>
            </label>

            <label>
              Scor
              <select
                name="scoreRange"
                value={filters.scoreRange}
                onChange={handleFilterChange}
              >
                <option value="">Toate scorurile</option>
                <option value="high">Peste 80</option>
                <option value="medium">Intre 60 si 79</option>
                <option value="low">Sub 60</option>
                <option value="without_score">Fara scor calculat</option>
              </select>
            </label>

            <label>
              Sortare
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
              >
                <option value="score_desc">Scor descrescator</option>
                <option value="score_asc">Scor crescator</option>
                <option value="date_desc">Cele mai recente</option>
                <option value="date_asc">Cele mai vechi</option>
              </select>
            </label>
          </form>

          <div className="ranking-summary">
            <div className="dashboard-card">
              <span>Candidati activi</span>
              <strong>{stats.total}</strong>
              <p>Nu sunt incluse candidaturile retrase sau respinse.</p>
            </div>

            <div className="dashboard-card">
              <span>Cu scor calculat</span>
              <strong>{stats.scored}</strong>
              <p>Aplicari pregatite pentru comparatie.</p>
            </div>

            <div className="dashboard-card">
              <span>Fara scor</span>
              <strong>{stats.withoutScore}</strong>
              <p>
                Calculeaza scorul din pagina{" "}
                <Link to="/applications">Aplicari</Link>.
              </p>
            </div>

            <div className="dashboard-card">
              <span>Scor mediu</span>
              <strong>
                {stats.averageScore === null
                  ? "-"
                  : stats.averageScore.toFixed(2)}
              </strong>
              <p>
                Cel mai bun scor:{" "}
                {stats.bestScore === null ? "-" : stats.bestScore.toFixed(2)}.
              </p>
            </div>
          </div>

          <div className="table-section">
            <h2>{jobInfo?.titlu_job || "Clasament job"}</h2>

            {isLoadingRanking ? (
              <p>Se incarca clasamentul...</p>
            ) : visibleRanking.length === 0 ? (
              <p>
                Nu exista candidaturi active care respecta filtrele selectate.
              </p>
            ) : (
              <table className="data-table ranking-table">
                <thead>
                  <tr>
                    <th>Loc</th>
                    <th>Candidat</th>
                    <th>Status</th>
                    <th>Scor</th>
                    <th>Recomandare AI</th>
                    <th>Competente lipsa</th>
                    <th>Data aplicare</th>
                    <th>Analiza</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleRanking.map((application, index) => {
                    const missingSkills = parseMissingSkills(
                      application.competente_lipsa
                    );
                    const missingSkillsCount =
                      missingSkills.obligatorii.length +
                      missingSkills.optionale.length;

                    return (
                      <tr key={application.id_aplicatie}>
                        <td>
                          <span className="rank-number">{index + 1}</span>
                        </td>
                        <td>
                          <strong>
                            {application.prenume} {application.nume}
                          </strong>
                          <span className="table-subtext">
                            {application.email}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${application.status?.toLowerCase()}`}
                          >
                            {statusLabels[application.status] ||
                              application.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`score-pill ${getScoreTone(
                              application.scor_compatibilitate
                            )}`}
                          >
                            {formatScore(application.scor_compatibilitate)}
                          </span>
                        </td>
                        <td>{getRecommendation(application)}</td>
                        <td>
                          {missingSkillsCount > 0
                            ? `${missingSkillsCount} competente`
                            : "Nicio competenta lipsa salvata"}
                        </td>
                        <td>
                          {application.data_aplicare
                            ? new Date(
                                application.data_aplicare
                              ).toLocaleDateString("ro-RO")
                            : "-"}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              handleOpenAnalysis(application.id_aplicatie)
                            }
                          >
                            Vezi analiza
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {(selectedAnalysis || isLoadingAnalysis || analysisError) && (
        <div className="side-panel-overlay" onClick={closeAnalysisPanel}>
          <aside
            className="side-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="side-panel-header">
              <div>
                <h2>Analiza candidat</h2>
                <p>
                  {selectedAnalysis
                    ? `${selectedAnalysis.candidate.prenume} ${selectedAnalysis.candidate.nume}`
                    : "Se incarca detaliile..."}
                </p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={closeAnalysisPanel}
                aria-label="Inchide panoul"
              >
                x
              </button>
            </div>

            {isLoadingAnalysis && <p>Se incarca analiza...</p>}
            {analysisError && <p className="error">{analysisError}</p>}

            {selectedAnalysis && (
              <>
                <div className="detail-grid">
                  <div>
                    <span>Job</span>
                    <strong>{selectedAnalysis.job.titlu_job}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>
                      {statusLabels[selectedAnalysis.application.status] ||
                        selectedAnalysis.application.status}
                    </strong>
                  </div>
                  <div>
                    <span>CV</span>
                    <strong>{selectedAnalysis.cv.nume_fisier}</strong>
                  </div>
                  <div>
                    <span>Scor final</span>
                    <strong>
                      {formatScore(
                        selectedAnalysis.scores.scor_compatibilitate
                      )}
                    </strong>
                  </div>
                </div>

                {explanation && (
                  <div className="description-block">
                    <h2>Rezumat AI</h2>
                    <div className="ai-summary-grid">
                      <div>
                        <span>Recomandare</span>
                        <strong>
                          {aiAnalysis?.recommendation || "-"}
                        </strong>
                      </div>
                      <div>
                        <span>Potrivire generala cu jobul</span>
                        <strong>
                          {formatScore(
                            aiAnalysis?.semantic_score ??
                              semanticScores?.overall
                          )}
                        </strong>
                      </div>
                      <div>
                        <span>Potrivire dupa criteriile jobului</span>
                        <strong>
                          {formatScore(aiAnalysis?.ahp_explainable_score)}
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

                    {detectedStrengths.length > 0 && (
                      <div className="ai-score-section">
                        <h3>Puncte forte detectate</h3>
                        <div className="ai-chip-list">
                          {detectedStrengths.map((strength) => (
                            <span
                              className="ai-chip ai-chip-success"
                              key={strength}
                            >
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {incompleteSections.length > 0 && (
                      <p className="info-message">
                        Scorul poate fi partial deoarece CV-ul nu contine
                        suficiente informatii pentru:{" "}
                        {incompleteSections.join(", ")}.
                      </p>
                    )}
                  </div>
                )}

                <div className="description-block">
                  <h2>
                    {semanticScores
                      ? "Evaluare pe criterii"
                      : "Scoruri partiale"}
                  </h2>
                  <div className="ai-summary-grid">
                    {semanticScores
                      ? Object.entries(semanticScores).map(([key, value]) => (
                          <div key={key}>
                            <span>{semanticScoreLabels[key] || key}</span>
                            <strong>{formatScore(value)}</strong>
                          </div>
                        ))
                      : scoreEntries.map(([key, value]) => (
                          <div key={key}>
                            <span>{scoreLabels[key] || key}</span>
                            <strong>{formatScore(value)}</strong>
                          </div>
                        ))}
                  </div>
                </div>

                <div className="description-block">
                  <h2>Competente lipsa</h2>

                  {selectedMissingSkills.legacyText ? (
                    <p>{selectedMissingSkills.legacyText}</p>
                  ) : selectedMissingSkills.obligatorii.length === 0 &&
                    selectedMissingSkills.optionale.length === 0 ? (
                    <p>Nu exista competente lipsa salvate.</p>
                  ) : (
                    <div className="missing-skills-grid">
                      <div>
                        <h3>Obligatorii</h3>
                        {selectedMissingSkills.obligatorii.length === 0 ? (
                          <p>Nu lipsesc competente obligatorii.</p>
                        ) : (
                          <ul>
                            {selectedMissingSkills.obligatorii.map((skill) => (
                              <li key={`required-${skill}`}>{skill}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <h3>Optionale</h3>
                        {selectedMissingSkills.optionale.length === 0 ? (
                          <p>Nu lipsesc competente optionale.</p>
                        ) : (
                          <ul>
                            {selectedMissingSkills.optionale.map((skill) => (
                              <li key={`optional-${skill}`}>{skill}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {canViewFeedback &&
                  selectedApplicationDetails?.interviews?.length > 0 && (
                  <div className="description-block">
                    <h2>Feedback interviuri</h2>

                    <div className="compact-list">
                      {selectedApplicationDetails.interviews.map((interview) => (
                        <div
                          className="compact-list-item"
                          key={interview.id_interviu}
                        >
                          <div>
                            <strong>
                              {interviewTypeLabels[interview.tip_interviu] ||
                                interview.tip_interviu}
                            </strong>
                            <span>{formatDateTime(interview.data_interviu)}</span>
                            <span>{interview.link_meeting || "-"}</span>

                            {buildFeedbackFromInterview(interview) ? (
                              <div className="feedback-preview">
                                <strong>Feedback salvat</strong>
                                <FeedbackDetails
                                  feedback={buildFeedbackFromInterview(interview)}
                                />
                              </div>
                            ) : (
                              <p>Nu exista feedback salvat pentru acest interviu.</p>
                            )}
                          </div>

                          <span
                            className={`status-badge status-${interview.status?.toLowerCase()}`}
                          >
                            {interviewStatusLabels[interview.status] ||
                              interview.status}
                          </span>

                          {canManageFeedbackForInterview(interview) &&
                            !buildFeedbackFromInterview(interview) && (
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => setFeedbackInterview(interview)}
                              disabled={isLoadingAnalysis}
                            >
                              Adauga feedback
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      )}

      {feedbackInterview && selectedApplicationDetails && (
        <FeedbackModal
          interview={feedbackInterview}
          candidateName={`${selectedApplicationDetails.prenume || ""} ${
            selectedApplicationDetails.nume || ""
          }`.trim()}
          jobTitle={selectedApplicationDetails.titlu_job}
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
          isSaving={isLoadingAnalysis}
        />
      )}
    </section>
  );
}

export default RankingsPage;
