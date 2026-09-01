import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  analyzeJobBias,
  applyAiRewrite,
  closeJob,
  deleteJob,
  getJobBiasAnalysis,
  getJobById,
  getJobSkills,
  publishJob,
} from "../services/jobService";
import { useAuth } from "../context/AuthContext";
import { getMyCvs } from "../services/cvService";
import {
  createApplication,
  getMyApplications,
} from "../services/applicationService";

const workModeLabels = {
  REMOTE: "Remote",
  HIBRID: "Hibrid",
  FIZIC: "Prezenta fizica",
};

const jobStatusLabels = {
  DRAFT: "Draft",
  ACTIV: "Activ",
  INCHIS: "Inchis",
};

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canViewBiasAnalysis =
    user?.rol === "RECRUTOR" ||
    user?.rol === "MANAGER" ||
    user?.rol === "ADMIN";

  const [job, setJob] = useState(null);
  const [biasAnalysis, setBiasAnalysis] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiRewrite, setAiRewrite] = useState("");
  const [candidateCvs, setCandidateCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [jobSkills, setJobSkills] = useState([]);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await getJobById(id);
        setJob(data);

        if (user?.rol === "RECRUTOR" || user?.rol === "CANDIDAT") {
          const skills = await getJobSkills(id);
          setJobSkills(skills);
        }

        if (user?.rol === "CANDIDAT") {
          try {
            const [cvs, applications] = await Promise.all([
              getMyCvs(),
              getMyApplications(),
            ]);

            setCandidateCvs(cvs);

            const hasApplied = applications.some(
              (application) => Number(application.id_job) === Number(id)
            );

            setAlreadyApplied(hasApplied);
          } catch {
            setCandidateCvs([]);
            setAlreadyApplied(false);
          }
        }

        if (canViewBiasAnalysis) {
          try {
            const analysis = await getJobBiasAnalysis(id);
            setBiasAnalysis(analysis);
            setAiRewrite("");
          } catch (analysisError) {
            if (analysisError.response?.status !== 404) {
              setActionError(
                analysisError.response?.data?.message || "Nu s-a putut incarca analiza de bias."
              );
            }
          }
        }

      } catch (err) {
        setError(err.response?.data?.message || "Nu s-au putut incarca detaliile jobului.");
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id, canViewBiasAnalysis, user?.rol]);

  const reloadJob = async () => {
    const data = await getJobById(id);
    setJob(data);
  };

  const handleApply = async () => {
    setActionMessage("");
    setActionError("");

    if (!selectedCvId) {
      setActionError("Selecteaza un CV pentru aplicare.");
      return;
    }

    setIsActionLoading(true);

    try {
      await createApplication({
        id_job: Number(id),
        id_cv: Number(selectedCvId),
      });

      setActionMessage("Aplicarea a fost trimisa cu succes.");
      setAlreadyApplied(true);
    } catch (err) {
      setActionError(err.response?.data?.message || "Nu s-a putut trimite aplicarea.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAnalyzeBias = async () => {
    setActionMessage("Analiza de bias este in curs. Poate dura cateva momente...");
    setActionError("");
    setIsActionLoading(true);

    try {
      const result = await analyzeJobBias(id);
      setBiasAnalysis(result.analysis);
      setAiRewrite(result.aiResult?.reformulated_description || "");
      setActionMessage("Analiza de bias a fost finalizata.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Nu s-a putut analiza jobul.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptRewrite = async () => {
    setActionMessage("");
    setActionError("");
    setIsActionLoading(true);

    try {
      const originalDescription = job.descriere_job?.trim() || "";
      const rewrittenDescription = aiRewrite.trim();

      if (
        !rewrittenDescription ||
        (originalDescription &&
          rewrittenDescription.length < originalDescription.length * 0.6)
      ) {
        setActionError(
          "Reformularea AI nu este completa. Te rugam sa editezi descrierea manual."
        );
        return;
      }

      const result = await applyAiRewrite(id, rewrittenDescription);

      setJob(result.job);
      setBiasAnalysis(result.analysis);
      setAiRewrite("");
      setActionMessage("Reformularea AI a fost acceptata. Jobul poate fi publicat.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Nu s-a putut accepta reformularea AI.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePublish = async () => {
    setActionMessage("");
    setActionError("");
    setIsActionLoading(true);

    try {
      await publishJob(id);
      await reloadJob();
      setActionMessage("Jobul a fost publicat cu succes.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Nu s-a putut publica jobul.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClose = async () => {
    setActionMessage("");
    setActionError("");
    setIsActionLoading(true);

    try {
      await closeJob(id);
      await reloadJob();
      setActionMessage("Jobul a fost inchis cu succes.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Nu s-a putut inchide jobul.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Sigur vrei sa stergi acest job? Actiunea nu poate fi anulata."
    );

    if (!confirmed) {
      return;
    }

    setActionMessage("");
    setActionError("");
    setIsActionLoading(true);

    try {
      await deleteJob(id);
      navigate("/jobs");
    } catch (err) {
      setActionError(err.response?.data?.message || "Nu s-a putut sterge jobul.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="page-section">
        <h1>Detalii job</h1>
        <p>Se incarca detaliile jobului...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-section">
        <h1>Detalii job</h1>
        <p className="error">{error}</p>
        <Link to="/jobs">Inapoi la joburi</Link>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="page-section">
        <h1>Detalii job</h1>
        <p>Jobul nu a fost gasit.</p>
        <Link to="/jobs">Inapoi la joburi</Link>
      </section>
    );
  }

  const needsNewAnalysis = Boolean(biasAnalysis?.analysis_needs_update);
  const hasDetectedBias = Boolean(biasAnalysis?.has_bias);
  const cannotPublish =
    !biasAnalysis ||
    hasDetectedBias ||
    needsNewAnalysis ||
    jobSkills.length === 0;
  const canRunBiasAnalysis = !biasAnalysis || needsNewAnalysis;
  const hasCompleteAiRewrite = Boolean(
    aiRewrite.trim() &&
      (!job.descriere_job ||
        aiRewrite.trim().length >= job.descriere_job.trim().length * 0.6)
  );

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>{job.titlu_job}</h1>
          <p>{job.nume_departament || "Fara departament"}</p>
        </div>
      </div>

      <div className="detail-panel">
        <div className="detail-grid">
          <div>
            <span>Status</span>
            <strong>
              <span className={`status-badge status-${job.status?.toLowerCase()}`}>
                {jobStatusLabels[job.status] || job.status}
              </span>
            </strong>
          </div>

          <div>
            <span>Salariu</span>
            <strong>
              {job.salariu_minim && job.salariu_maxim
                ? `${job.salariu_minim} - ${job.salariu_maxim}`
                : "Nespecificat"}
            </strong>
          </div>

          <div>
            <span>Locatie</span>
            <strong>
              {job.oras && job.tara
                ? `${job.oras}, ${job.tara}`
                : "Nespecificata"}
            </strong>
          </div>

          <div>
            <span>Mod de lucru</span>
            <strong>
              {workModeLabels[job.mod_lucru] || "Nespecificat"}
            </strong>
          </div>

          <div>
            <span>Publicat</span>
            <strong>
              {job.data_publicare
                ? new Date(job.data_publicare).toLocaleDateString()
                : "-"}
            </strong>
          </div>

          <div>
            <span>Rolul tau</span>
            <strong>{user?.rol}</strong>
          </div>
        </div>

        <div className="description-block">
          <h2>Descriere</h2>
          <p>{job.descriere_job || "Nu exista descriere disponibila."}</p>
        </div>

        {(actionError || actionMessage) && (
          <div className="job-action-feedback">
            {actionError && <p className="error">{actionError}</p>}
            {actionMessage && <p className="success">{actionMessage}</p>}
          </div>
        )}

        {user?.rol === "CANDIDAT" && jobSkills.length > 0 && (
          <div className="description-block">
            <h2>Competente cautate</h2>
            <div className="job-skill-groups">
              <div>
                <h3>Obligatorii</h3>
                {jobSkills.filter((skill) => skill.este_obligatoriu).length === 0 ? (
                  <p>Nu au fost marcate competente obligatorii.</p>
                ) : (
                  <div className="skill-chip-list">
                    {jobSkills
                      .filter((skill) => skill.este_obligatoriu)
                      .map((skill) => (
                        <span className="skill-chip required-skill" key={skill.id_competenta}>
                          {skill.nume_competenta}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <h3>Optionale</h3>
                {jobSkills.filter((skill) => !skill.este_obligatoriu).length === 0 ? (
                  <p>Nu au fost marcate competente optionale.</p>
                ) : (
                  <div className="skill-chip-list">
                    {jobSkills
                      .filter((skill) => !skill.este_obligatoriu)
                      .map((skill) => (
                        <span className="skill-chip optional-skill" key={skill.id_competenta}>
                          {skill.nume_competenta}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {user?.rol === "RECRUTOR" && jobSkills.length === 0 && (
          <p className="info-message">
            Adauga cel putin o competenta la job inainte de publicare si
            calcularea scorurilor.
          </p>
        )}

        {canViewBiasAnalysis && (
          <div className="description-block">
            <h2>Analiza de bias</h2>

            {biasAnalysis ? (
              <>
                <p>
                  <strong>Detectat:</strong>{" "}
                  {needsNewAnalysis
                    ? "Descrierea a fost modificata dupa ultima analiza."
                    : biasAnalysis.has_bias
                    ? biasAnalysis.bias_detectat || "A fost detectat bias."
                    : "Nu exista probleme detectate in analiza curenta."}
                </p>
                {needsNewAnalysis && (
                  <p>
                    Ruleaza analiza de bias din nou inainte de publicare.
                  </p>
                )}
                {!needsNewAnalysis && !biasAnalysis.has_bias && biasAnalysis.bias_detectat && (
                  <p>
                    <strong>Detectat anterior:</strong>{" "}
                    {biasAnalysis.bias_detectat}
                  </p>
                )}
                <p>
                  <strong>Sugestii:</strong>{" "}
                  {biasAnalysis.sugestii_reformulare || "Nu exista sugestii disponibile."}
                </p>

                {hasCompleteAiRewrite && (
                  <div className="description-block">
                    <h3>Descriere completa sugerata</h3>
                    <p>{aiRewrite}</p>

                    {user?.rol === "RECRUTOR" && job.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={handleAcceptRewrite}
                        disabled={isActionLoading}
                      >
                        Accepta reformularea
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p>Nu a fost generata inca o analiza de bias.</p>
            )}
          </div>
        )}

        {user?.rol === "CANDIDAT" && job.status === "ACTIV" && (
          <div className="application-panel">
            <div className="candidate-apply-box">
              <h2>Aplica la job</h2>

              {alreadyApplied ? (
                <>
                  <p>Ai aplicat deja la acest job.</p>
                  <Link className="button-link secondary-link" to="/my-applications">
                    Urmareste candidatura
                  </Link>
                </>
              ) : candidateCvs.length === 0 ? (
                <>
                  <p>Trebuie sa incarci un CV inainte sa aplici.</p>
                  <Link className="button-link" to="/my-cvs">
                    Incarca un CV
                  </Link>
                </>
              ) : (
                <>
                  <label>
                    Alege CV-ul
                    <select
                      value={selectedCvId}
                      onChange={(event) => setSelectedCvId(event.target.value)}
                    >
                      <option value="">Selecteaza CV</option>
                      {candidateCvs.map((cv) => (
                        <option key={cv.id_cv} value={cv.id_cv}>
                          {cv.nume_fisier}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={isActionLoading || !selectedCvId}
                  >
                    Aplica
                  </button>
                </>
              )}

              {!alreadyApplied && candidateCvs.length > 0 && (
                <Link to="/my-cvs">Gestioneaza CV-uri</Link>
              )}

              <div className="application-help">
                <h3>Ce se intampla dupa aplicare?</h3>
                <ul>
                  <li>Candidatura este trimisa catre echipa de recrutare.</li>
                  <li>Vei putea urmari progresul in pagina Aplicarile mele.</li>
                  <li>Vei primi notificari pentru interviuri si decizia finala.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {user?.rol === "CANDIDAT" && job.status !== "ACTIV" && (
          <p className="info-message">
            Acest job nu este disponibil pentru aplicare in acest moment.
          </p>
        )}

        <div className="detail-actions">
          {user?.rol === "RECRUTOR" && (
            <>
              <Link className="button-link" to={`/jobs/${job.id_job}/edit`}>
                Editeaza job
              </Link>

              <Link className="button-link" to={`/jobs/${job.id_job}/skills`}>
                Gestioneaza competente
              </Link>

              <button
                type="button"
                onClick={handleAnalyzeBias}
                disabled={isActionLoading || !canRunBiasAnalysis}
              >
                {canRunBiasAnalysis ? "Analizeaza bias" : "Analiza deja efectuata"}
              </button>

              {job.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isActionLoading || cannotPublish}
                >
                  Publica job
                </button>
              )}

              {job.status === "ACTIV" && (
                <button
                  type="button"
                  className="danger-button"
                  onClick={handleClose}
                  disabled={isActionLoading}
                >
                  Inchide job
                </button>
              )}

              <button
                type="button"
                className="danger-button"
                onClick={handleDelete}
                disabled={isActionLoading}
              >
                Sterge job
              </button>
            </>
          )}

          {user?.rol === "MANAGER" && (
            <button type="button">Vezi aplicarile mai tarziu</button>
          )}

          <Link className="button-link secondary-link" to="/jobs">
            Inapoi la joburi
          </Link>
        </div>
      </div>
    </section>
  );
}

export default JobDetailPage;
