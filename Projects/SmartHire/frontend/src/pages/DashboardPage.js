import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyApplications, getJobApplications } from "../services/applicationService";
import { getMyCvs } from "../services/cvService";
import { getCompany } from "../services/companyService";
import { getDepartments } from "../services/departmentService";
import { getJobInterviews, getMyInterviews } from "../services/interviewService";
import { getJobs } from "../services/jobService";
import { getMyNotifications } from "../services/notificationService";
import { getUsers } from "../services/userService";

const roleLabels = {
  ADMIN: "administrator",
  RECRUTOR: "recrutor",
  MANAGER: "manager",
  CANDIDAT: "candidat",
};

const applicationStatusLabels = {
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

const formatDate = (value) => {
  return value
    ? new Date(value).toLocaleString("ro-RO", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";
};

const getUpcomingInterviews = (interviews) => {
  const now = new Date();

  return interviews
    .filter(
      (interview) =>
        interview.status === "PROGRAMAT" &&
        interview.data_interviu &&
        new Date(interview.data_interviu) >= now
    )
    .sort(
      (first, second) =>
        new Date(first.data_interviu) - new Date(second.data_interviu)
    )
    .slice(0, 3);
};

function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState([]);
  const [links, setLinks] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    nextStep: null,
    recentApplications: [],
    upcomingInterviews: [],
    attentionItems: [],
    pipeline: [],
    topCandidates: [],
    systemItems: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const displayName =
    user?.nume && user?.prenume
      ? `${user.prenume} ${user.nume}`
      : user?.email;

  useEffect(() => {
    const countUnreadNotifications = async () => {
      const notifications = await getMyNotifications();
      return notifications.filter((notification) => !notification.citit).length;
    };

    const loadAdminDashboard = async () => {
      const [departments, users, jobs, unreadNotifications] = await Promise.all([
        getDepartments(),
        getUsers(),
        getJobs(),
        countUnreadNotifications(),
      ]);

      const company = await getCompany().catch(() => null);

      const staffUsers = users.filter(
        (currentUser) =>
          currentUser.rol === "RECRUTOR" || currentUser.rol === "MANAGER"
      );
      const candidateUsers = users.filter(
        (currentUser) => currentUser.rol === "CANDIDAT"
      );

      setStats([
        { label: "Departamente", value: departments.length, hint: "structura companiei" },
        { label: "Conturi interne", value: staffUsers.length, hint: "recruiteri si manageri" },
        { label: "Conturi candidati", value: candidateUsers.length, hint: "utilizatori candidati" },
        { label: "Joburi in sistem", value: jobs.length, hint: "toate statusurile" },
        { label: "Evenimente istoric", value: unreadNotifications, hint: "necitite" },
      ]);

      setDashboardData({
        nextStep: company
          ? {
              title: "Configurarea companiei este activa",
              text: `${company.nume_companie} este compania configurata pentru aceasta instalare.`,
              action: "Vezi compania",
              path: "/company",
            }
          : {
              title: "Configureaza compania",
              text: "Adauga datele companiei inainte de folosirea completa a aplicatiei.",
              action: "Configureaza",
              path: "/company",
            },
        recentApplications: [],
        upcomingInterviews: [],
        attentionItems: [],
        pipeline: [],
        topCandidates: [],
        systemItems: [
          {
            label: "Companie",
            value: company ? "Configurata" : "Lipsa",
            tone: company ? "success" : "danger",
          },
          {
            label: "Departamente",
            value: departments.length,
            tone: departments.length > 0 ? "success" : "warning",
          },
          {
            label: "Recruiteri",
            value: users.filter((item) => item.rol === "RECRUTOR").length,
            tone: "info",
          },
          {
            label: "Manageri",
            value: users.filter((item) => item.rol === "MANAGER").length,
            tone: "info",
          },
        ],
      });

      setLinks([
        { label: "Companie", path: "/company" },
        { label: "Departamente", path: "/departments" },
        { label: "Conturi companie", path: "/staff-users" },
        { label: "Conturi candidati", path: "/candidate-users" },
        { label: "Istoric", path: "/notifications" },
      ]);
    };

    const loadCandidateDashboard = async () => {
      const [jobs, applications, cvs, interviews, unreadNotifications] = await Promise.all([
        getJobs(),
        getMyApplications(),
        getMyCvs(),
        getMyInterviews().catch(() => []),
        countUnreadNotifications(),
      ]);

      const upcomingInterviews = getUpcomingInterviews(interviews);
      const activeApplications = applications.filter(
        (application) =>
          application.status !== "RESPINSA" &&
          application.status !== "RETRASA"
      );

      setStats([
        { label: "Joburi disponibile", value: jobs.length, hint: "active pentru aplicare" },
        { label: "Aplicari active", value: activeApplications.length, hint: "in proces" },
        { label: "Interviuri viitoare", value: upcomingInterviews.length, hint: "programate" },
        { label: "Notificari necitite", value: unreadNotifications, hint: "noutati" },
      ]);

      let nextStep;

      if (cvs.length === 0) {
        nextStep = {
          title: "Incarca primul CV",
          text: "Ai nevoie de un CV incarcat pentru a putea aplica la joburi.",
          action: "Incarca CV",
          path: "/my-cvs",
        };
      } else if (upcomingInterviews.length > 0) {
        nextStep = {
          title: "Pregateste urmatorul interviu",
          text: `Ai un interviu pe ${formatDate(upcomingInterviews[0].data_interviu)}.`,
          action: "Vezi interviurile",
          path: "/interviews",
        };
      } else if (applications.length === 0) {
        nextStep = {
          title: "Exploreaza joburile active",
          text: "Ai CV incarcat, deci poti incepe sa aplici la joburile potrivite.",
          action: "Vezi joburi",
          path: "/jobs",
        };
      } else {
        nextStep = {
          title: "Urmareste statusul aplicarilor",
          text: "Verifica evolutia candidaturilor si mesajele primite.",
          action: "Aplicarile mele",
          path: "/my-applications",
        };
      }

      setDashboardData({
        nextStep,
        recentApplications: applications.slice(0, 3),
        upcomingInterviews,
        attentionItems: [],
        pipeline: [],
        topCandidates: [],
        systemItems: [],
      });

      setLinks([
        { label: "Vezi joburi", path: "/jobs" },
        { label: "Aplicarile mele", path: "/my-applications" },
        { label: "CV-urile mele", path: "/my-cvs" },
        { label: "Notificari", path: "/notifications" },
      ]);
    };

    const loadStaffDashboard = async () => {
      const [jobs, unreadNotifications] = await Promise.all([
        getJobs(),
        countUnreadNotifications(),
      ]);

      const applicationsByJob = await Promise.all(
        jobs.map((job) =>
          getJobApplications(job.id_job)
            .then((applications) =>
              applications.map((application) => ({
                ...application,
                titlu_job: job.titlu_job,
              }))
            )
            .catch(() => [])
        )
      );

      const interviewsByJob = await Promise.all(
        jobs.map((job) =>
          getJobInterviews(job.id_job)
            .then((interviews) =>
              interviews.map((interview) => ({
                ...interview,
                titlu_job: job.titlu_job,
              }))
            )
            .catch(() => [])
        )
      );

      const applications = applicationsByJob.flat();
      const interviews = interviewsByJob.flat();
      const upcomingInterviews = getUpcomingInterviews(interviews);
      const draftJobs = jobs.filter((job) => job.status === "DRAFT");
      const activeJobs = jobs.filter((job) => job.status === "ACTIV");
      const applicationsWithoutScore = applications.filter(
        (application) =>
          application.status !== "RETRASA" &&
          application.scor_compatibilitate === null
      );
      const rescheduleRequests = interviews.filter(
        (interview) => interview.status === "REPROGRAMARE_SOLICITATA"
      );

      setStats([
        {
          label:
            user?.rol === "MANAGER" ? "Joburi departament" : "Joburile mele",
          value: jobs.length,
          hint: user?.rol === "MANAGER" ? "departament" : "portofoliu",
        },
        { label: "Joburi active", value: activeJobs.length, hint: "publicate" },
        { label: "Aplicari fara scor", value: applicationsWithoutScore.length, hint: "necesita analiza" },
        { label: "Interviuri viitoare", value: upcomingInterviews.length, hint: "programate" },
        { label: "Notificari necitite", value: unreadNotifications, hint: "noutati" },
      ]);

      const pipelineStatuses = ["DEPUSA", "IN_ANALIZA", "ACCEPTATA", "RESPINSA", "RETRASA"];

      setDashboardData({
        nextStep: applicationsWithoutScore.length > 0
          ? {
              title: "Calculeaza scorurile lipsa",
              text: `${applicationsWithoutScore.length} candidaturi nu au inca scor de compatibilitate.`,
              action: "Vezi aplicarile",
              path: "/applications",
            }
            : rescheduleRequests.length > 0
            ? {
                title: "Exista cereri de reprogramare",
                text: "Verifica interviurile care necesita confirmare.",
                action: "Vezi interviuri",
                path: "/interviews",
              }
            : draftJobs.length > 0
              ? {
                  title:
                    draftJobs.length === 1
                      ? "Ai un job draft nepublicat"
                      : `Ai ${draftJobs.length} joburi draft nepublicate`,
                  text:
                    "Verifica analiza de bias, competentele si publica jobul cand este pregatit.",
                  action: "Vezi joburi",
                  path: "/jobs",
                }
            : {
                title: "Procesul este la zi",
                text: "Nu exista actiuni critice in acest moment.",
                action: "Vezi joburi",
                path: "/jobs",
              },
        recentApplications: applications
          .sort(
            (first, second) =>
              new Date(second.data_aplicare || 0) -
              new Date(first.data_aplicare || 0)
          )
          .slice(0, 3),
        upcomingInterviews,
        attentionItems: [
          ...draftJobs.slice(0, 2).map((job) => ({
            title: job.titlu_job,
            text: "Job draft - verifica descrierea, competentele si analiza de bias.",
            path: `/jobs/${job.id_job}`,
            tone: "warning",
          })),
          ...rescheduleRequests.slice(0, 2).map((interview) => ({
            title: `${interview.nume || ""} ${interview.prenume || ""}`.trim() || "Interviu",
            text: "Candidatul a solicitat reprogramarea interviului.",
            path: `/applications/${interview.id_aplicatie}`,
            tone: "danger",
          })),
        ],
        pipeline: pipelineStatuses.map((status) => ({
          status,
          label: applicationStatusLabels[status],
          value: applications.filter((application) => application.status === status).length,
        })),
        topCandidates: applications
          .filter((application) => application.scor_compatibilitate !== null)
          .sort(
            (first, second) =>
              Number(second.scor_compatibilitate || 0) -
              Number(first.scor_compatibilitate || 0)
          )
          .slice(0, 3),
        systemItems: [],
      });

      setLinks([
        ...(user?.rol === "RECRUTOR"
          ? [{ label: "Creeaza job", path: "/jobs/new" }]
          : []),
        { label: "Joburi", path: "/jobs" },
        { label: "Aplicari", path: "/applications" },
        { label: "Interviuri", path: "/interviews" },
      ]);
    };

    const loadDashboard = async () => {
      try {
        setError("");

        if (user?.rol === "ADMIN") {
          await loadAdminDashboard();
        } else if (user?.rol === "CANDIDAT") {
          await loadCandidateDashboard();
        } else if (user?.rol === "RECRUTOR" || user?.rol === "MANAGER") {
          await loadStaffDashboard();
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Nu s-au putut incarca datele pentru panoul principal."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [user?.rol]);

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Panou principal</h1>
          <p>
            Bine ai venit, {displayName}. Esti autentificat ca{" "}
            {roleLabels[user?.rol] || user?.rol}.
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {isLoading ? (
        <p>Se incarca panoul principal...</p>
      ) : (
        <>
          <div className="dashboard-grid">
            {stats.map((stat) => (
              <article className="dashboard-card" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                {stat.hint && <p>{stat.hint}</p>}
              </article>
            ))}
          </div>

          {dashboardData.nextStep && (
            <section className="dashboard-highlight">
              <div>
                <span>Urmatorul pas recomandat</span>
                <h2>{dashboardData.nextStep.title}</h2>
                <p>{dashboardData.nextStep.text}</p>
              </div>

              <Link className="button-link" to={dashboardData.nextStep.path}>
                {dashboardData.nextStep.action}
              </Link>
            </section>
          )}

          {dashboardData.systemItems.length > 0 && (
            <section className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Configurare sistem</h2>
                <p>Elemente importante pentru functionarea aplicatiei.</p>
              </div>

              <div className="mini-card-grid">
                {dashboardData.systemItems.map((item) => (
                  <article className={`mini-card mini-card-${item.tone}`} key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </section>
          )}

          {dashboardData.pipeline.length > 0 && (
            <section className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Pipeline candidaturi</h2>
                <p>Distributia candidaturilor dupa status.</p>
              </div>

              <div className="pipeline-grid">
                {dashboardData.pipeline.map((item) => (
                  <article className="pipeline-item" key={item.status}>
                    <span className={`status-badge status-${item.status.toLowerCase()}`}>
                      {item.label}
                    </span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </section>
          )}

          {dashboardData.attentionItems.length > 0 && (
            <section className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Atentie necesara</h2>
                <p>Elemente care merita verificate inainte sa avansezi procesul.</p>
              </div>

              <div className="attention-list">
                {dashboardData.attentionItems.map((item) => (
                  <Link className={`attention-item attention-${item.tone}`} key={`${item.title}-${item.path}`} to={item.path}>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(dashboardData.recentApplications.length > 0 ||
            dashboardData.upcomingInterviews.length > 0 ||
            dashboardData.topCandidates.length > 0) && (
            <div className="dashboard-columns">
              {dashboardData.recentApplications.length > 0 && (
                <section className="dashboard-section">
                  <div className="dashboard-section-header">
                    <h2>Aplicari recente</h2>
                    <p>Ultimele candidaturi relevante pentru rolul tau.</p>
                  </div>

                  <div className="compact-list">
                    {dashboardData.recentApplications.map((application) => (
                      <Link
                        className="compact-list-item"
                        key={application.id_aplicatie}
                        to={
                          user?.rol === "CANDIDAT"
                            ? `/applications/${application.id_aplicatie}`
                            : `/applications/${application.id_aplicatie}`
                        }
                      >
                        <div>
                          <strong>
                            {user?.rol === "CANDIDAT"
                              ? application.titlu_job
                              : `${application.nume || ""} ${application.prenume || ""}`.trim()}
                          </strong>
                          <span>
                            {user?.rol === "CANDIDAT"
                              ? formatDate(application.data_aplicare)
                              : application.titlu_job || "Job"}
                          </span>
                        </div>
                        <span className={`status-badge status-${application.status?.toLowerCase()}`}>
                          {applicationStatusLabels[application.status] || application.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {dashboardData.upcomingInterviews.length > 0 && (
                <section className="dashboard-section">
                  <div className="dashboard-section-header">
                    <h2>Interviuri viitoare</h2>
                    <p>Programari apropiate care necesita atentie.</p>
                  </div>

                  <div className="compact-list">
                    {dashboardData.upcomingInterviews.map((interview) => (
                      <Link
                        className="compact-list-item"
                        key={interview.id_interviu}
                        to={`/applications/${interview.id_aplicatie}`}
                      >
                        <div>
                          <strong>
                            {user?.rol === "CANDIDAT"
                              ? interview.titlu_job
                              : `${interview.nume || ""} ${interview.prenume || ""}`.trim()}
                          </strong>
                          <span>{formatDate(interview.data_interviu)}</span>
                        </div>
                        <span className={`status-badge status-${interview.status?.toLowerCase()}`}>
                          {interviewStatusLabels[interview.status] || interview.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {dashboardData.topCandidates.length > 0 && (
                <section className="dashboard-section">
                  <div className="dashboard-section-header">
                    <h2>Candidati cu scor mare</h2>
                    <p>Top candidaturi dupa scorul de compatibilitate.</p>
                  </div>

                  <div className="compact-list">
                    {dashboardData.topCandidates.map((application) => (
                      <Link
                        className="compact-list-item"
                        key={application.id_aplicatie}
                        to={`/applications/${application.id_aplicatie}`}
                      >
                        <div>
                          <strong>
                            {application.nume} {application.prenume}
                          </strong>
                          <span>{application.titlu_job || "Job"}</span>
                        </div>
                        <span className="score-pill">
                          {application.scor_compatibilitate}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          <div className="quick-actions">
            <h2>Actiuni rapide</h2>
            <div>
              {links.map((link) => (
                <Link className="button-link secondary-link" key={link.path} to={link.path}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardPage;
