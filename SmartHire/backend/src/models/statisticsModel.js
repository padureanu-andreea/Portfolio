const pool = require("../config/db");

const APPLICATION_STATUS_LABELS = {
  DEPUSA: "Depuse",
  IN_ANALIZA: "In analiza",
  ACCEPTATA: "Acceptate",
  RESPINSA: "Respinse",
  RETRASA: "Retrase"
};

const INTERVIEW_STATUS_LABELS = {
  PROGRAMAT: "Programate",
  FINALIZAT: "Finalizate",
  ANULAT: "Anulate",
  REPROGRAMARE_SOLICITATA: "Reprogramare solicitata",
  NEPREZENTAT: "Neprezentat"
};

const JOB_STATUS_LABELS = {
  DRAFT: "Draft",
  ACTIV: "Active",
  INCHIS: "Inchise"
};

const getRecruiterByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id_recrutor, id_departament
     FROM recrutori
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const getManagerByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id_manager, id_departament
     FROM manageri
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const buildJobScope = (scope, alias = "j") => {
  if (scope.type === "ADMIN") {
    return {
      where: "",
      values: []
    };
  }

  if (scope.type === "RECRUTOR") {
    return {
      where: `WHERE ${alias}.id_recrutor = $1 AND ${alias}.id_departament = $2`,
      values: [scope.id_recrutor, scope.id_departament]
    };
  }

  return {
    where: `WHERE ${alias}.id_departament = $1`,
    values: [scope.id_departament]
  };
};

const getSingleRow = async (query, values = []) => {
  const result = await pool.query(query, values);
  return result.rows[0] || {};
};

const getRows = async (query, values = []) => {
  const result = await pool.query(query, values);
  return result.rows;
};

const normalizeStatusRows = (rows, labels) =>
  Object.entries(labels).map(([status, label]) => {
    const match = rows.find((row) => row.status === status);

    return {
      status,
      label,
      value: Number(match?.value || 0)
    };
  });

const getJobStats = async (scope) => {
  const jobScope = buildJobScope(scope);

  const summary = await getSingleRow(
    `SELECT
       COUNT(*)::int AS total_jobs,
       COUNT(*) FILTER (WHERE status = 'ACTIV')::int AS active_jobs,
       COUNT(*) FILTER (WHERE status = 'DRAFT')::int AS draft_jobs,
       COUNT(*) FILTER (WHERE status = 'INCHIS')::int AS closed_jobs
     FROM joburi j
     ${jobScope.where}`,
    jobScope.values
  );

  const byStatusRows = await getRows(
    `SELECT status, COUNT(*)::int AS value
     FROM joburi j
     ${jobScope.where}
     GROUP BY status`,
    jobScope.values
  );

  return {
    summary,
    byStatus: normalizeStatusRows(byStatusRows, JOB_STATUS_LABELS)
  };
};

const getApplicationStats = async (scope) => {
  const jobScope = buildJobScope(scope, "j");

  const summary = await getSingleRow(
    `SELECT
       COUNT(a.id_aplicatie)::int AS total_applications,
       COUNT(a.id_aplicatie) FILTER (WHERE a.status = 'DEPUSA')::int AS submitted_applications,
       COUNT(a.id_aplicatie) FILTER (WHERE a.status = 'IN_ANALIZA')::int AS in_review_applications,
       COUNT(a.id_aplicatie) FILTER (WHERE a.status = 'ACCEPTATA')::int AS accepted_applications,
       COUNT(a.id_aplicatie) FILTER (WHERE a.status = 'RESPINSA')::int AS rejected_applications,
       COUNT(a.id_aplicatie) FILTER (WHERE a.status = 'RETRASA')::int AS withdrawn_applications,
       COUNT(a.id_aplicatie) FILTER (WHERE a.scor_compatibilitate IS NOT NULL)::int AS scored_applications,
       COUNT(a.id_aplicatie) FILTER (WHERE a.scor_compatibilitate IS NULL)::int AS unscored_applications,
       ROUND(AVG(a.scor_compatibilitate)::numeric, 2) AS average_score
     FROM aplicatii a
     JOIN joburi j ON a.id_job = j.id_job
     ${jobScope.where}`,
    jobScope.values
  );

  const byStatusRows = await getRows(
    `SELECT a.status, COUNT(*)::int AS value
     FROM aplicatii a
     JOIN joburi j ON a.id_job = j.id_job
     ${jobScope.where}
     GROUP BY a.status`,
    jobScope.values
  );

  const byJob = await getRows(
    `SELECT
       j.id_job,
       j.titlu_job AS name,
       COUNT(a.id_aplicatie)::int AS value
     FROM joburi j
     LEFT JOIN aplicatii a ON a.id_job = j.id_job
     ${jobScope.where}
     GROUP BY j.id_job, j.titlu_job
     ORDER BY value DESC, j.titlu_job ASC
     LIMIT 8`,
    jobScope.values
  );

  const scoreDistribution = await getRows(
    `SELECT bucket AS label, COUNT(*)::int AS value
     FROM (
       SELECT
         CASE
           WHEN a.scor_compatibilitate < 31 THEN '0-30'
           WHEN a.scor_compatibilitate < 61 THEN '31-60'
           WHEN a.scor_compatibilitate < 81 THEN '61-80'
           ELSE '81-100'
         END AS bucket
       FROM aplicatii a
       JOIN joburi j ON a.id_job = j.id_job
       ${jobScope.where}
         ${jobScope.where ? "AND" : "WHERE"} a.scor_compatibilitate IS NOT NULL
     ) scored
     GROUP BY bucket
     ORDER BY
       CASE bucket
         WHEN '0-30' THEN 1
         WHEN '31-60' THEN 2
         WHEN '61-80' THEN 3
         ELSE 4
       END`,
    jobScope.values
  );

  return {
    summary,
    byStatus: normalizeStatusRows(byStatusRows, APPLICATION_STATUS_LABELS),
    byJob,
    scoreDistribution: ["0-30", "31-60", "61-80", "81-100"].map((label) => {
      const match = scoreDistribution.find((row) => row.label === label);

      return {
        label,
        value: Number(match?.value || 0)
      };
    })
  };
};

const getInterviewStats = async (scope) => {
  const jobScope = buildJobScope(scope, "j");

  const summary = await getSingleRow(
    `SELECT
       COUNT(i.id_interviu)::int AS total_interviews,
       COUNT(i.id_interviu) FILTER (WHERE i.status = 'PROGRAMAT')::int AS scheduled_interviews,
       COUNT(i.id_interviu) FILTER (WHERE i.status = 'FINALIZAT')::int AS completed_interviews,
       COUNT(i.id_interviu) FILTER (WHERE i.status = 'ANULAT')::int AS canceled_interviews,
       COUNT(i.id_interviu) FILTER (WHERE i.status = 'REPROGRAMARE_SOLICITATA')::int AS reschedule_requests,
       COUNT(i.id_interviu) FILTER (WHERE i.status = 'NEPREZENTAT')::int AS no_show_interviews
     FROM interviuri i
     JOIN aplicatii a ON i.id_aplicatie = a.id_aplicatie
     JOIN joburi j ON a.id_job = j.id_job
     ${jobScope.where}`,
    jobScope.values
  );

  const byStatusRows = await getRows(
    `SELECT i.status, COUNT(*)::int AS value
     FROM interviuri i
     JOIN aplicatii a ON i.id_aplicatie = a.id_aplicatie
     JOIN joburi j ON a.id_job = j.id_job
     ${jobScope.where}
     GROUP BY i.status`,
    jobScope.values
  );

  return {
    summary,
    byStatus: normalizeStatusRows(byStatusRows, INTERVIEW_STATUS_LABELS)
  };
};

const getCompanyDepartmentStats = async () => {
  const rows = await getRows(`
    SELECT
      d.id_departament,
      d.nume_departament AS name,
      COUNT(DISTINCT j.id_job)::int AS jobs,
      COUNT(DISTINCT a.id_aplicatie)::int AS applications,
      COUNT(DISTINCT i.id_interviu)::int AS interviews,
      COUNT(DISTINCT a.id_aplicatie) FILTER (WHERE a.status = 'ACCEPTATA')::int AS accepted
    FROM departamente d
    LEFT JOIN joburi j ON j.id_departament = d.id_departament
    LEFT JOIN aplicatii a ON a.id_job = j.id_job
    LEFT JOIN interviuri i ON i.id_aplicatie = a.id_aplicatie
    GROUP BY d.id_departament, d.nume_departament
    ORDER BY applications DESC, jobs DESC, d.nume_departament ASC
  `);

  return rows.map((row) => ({
    ...row,
    jobs: Number(row.jobs || 0),
    applications: Number(row.applications || 0),
    interviews: Number(row.interviews || 0),
    accepted: Number(row.accepted || 0)
  }));
};

const getAdminSummary = async () => {
  const users = await getSingleRow(`
    SELECT
      COUNT(*) FILTER (WHERE rol = 'CANDIDAT')::int AS candidate_users,
      COUNT(*) FILTER (WHERE rol = 'RECRUTOR')::int AS recruiter_users,
      COUNT(*) FILTER (WHERE rol = 'MANAGER')::int AS manager_users,
      COUNT(*) FILTER (WHERE rol = 'ADMIN')::int AS admin_users
    FROM utilizatori
  `);

  const departments = await getSingleRow(`
    SELECT COUNT(*)::int AS departments
    FROM departamente
  `);

  return {
    ...users,
    departments: Number(departments.departments || 0)
  };
};

const getRecruitmentStatistics = async (scope) => {
  const [jobStats, applicationStats, interviewStats] = await Promise.all([
    getJobStats(scope),
    getApplicationStats(scope),
    getInterviewStats(scope)
  ]);

  const totalApplications = Number(
    applicationStats.summary.total_applications || 0
  );
  const totalInterviews = Number(interviewStats.summary.total_interviews || 0);
  const acceptedApplications = Number(
    applicationStats.summary.accepted_applications || 0
  );
  const scoredApplications = Number(
    applicationStats.summary.scored_applications || 0
  );

  const summary = {
    totalJobs: Number(jobStats.summary.total_jobs || 0),
    activeJobs: Number(jobStats.summary.active_jobs || 0),
    draftJobs: Number(jobStats.summary.draft_jobs || 0),
    closedJobs: Number(jobStats.summary.closed_jobs || 0),
    totalApplications,
    submittedApplications: Number(
      applicationStats.summary.submitted_applications || 0
    ),
    inReviewApplications: Number(
      applicationStats.summary.in_review_applications || 0
    ),
    acceptedApplications,
    rejectedApplications: Number(
      applicationStats.summary.rejected_applications || 0
    ),
    withdrawnApplications: Number(
      applicationStats.summary.withdrawn_applications || 0
    ),
    scoredApplications,
    unscoredApplications: Number(
      applicationStats.summary.unscored_applications || 0
    ),
    averageScore: Number(applicationStats.summary.average_score || 0),
    totalInterviews,
    scheduledInterviews: Number(
      interviewStats.summary.scheduled_interviews || 0
    ),
    completedInterviews: Number(
      interviewStats.summary.completed_interviews || 0
    ),
    canceledInterviews: Number(interviewStats.summary.canceled_interviews || 0),
    rescheduleRequests: Number(
      interviewStats.summary.reschedule_requests || 0
    ),
    noShowInterviews: Number(interviewStats.summary.no_show_interviews || 0),
    applicationToInterviewRate:
      totalApplications === 0
        ? 0
        : Math.round((totalInterviews / totalApplications) * 100),
    interviewToAcceptedRate:
      totalInterviews === 0
        ? 0
        : Math.round((acceptedApplications / totalInterviews) * 100)
  };

  const pipeline = [
    { label: "Aplicari", value: totalApplications },
    { label: "Scor calculat", value: scoredApplications },
    { label: "Interviuri", value: totalInterviews },
    { label: "Acceptari", value: acceptedApplications }
  ];

  const data = {
    scope: scope.type,
    summary,
    applicationsByJob: applicationStats.byJob,
    applicationsByStatus: applicationStats.byStatus,
    interviewsByStatus: interviewStats.byStatus,
    jobsByStatus: jobStats.byStatus,
    scoreDistribution: applicationStats.scoreDistribution,
    pipeline
  };

  if (scope.type === "ADMIN") {
    const [departmentStats, adminSummary] = await Promise.all([
      getCompanyDepartmentStats(),
      getAdminSummary()
    ]);

    data.departmentStats = departmentStats;
    data.adminSummary = adminSummary;
  }

  return data;
};

module.exports = {
  getRecruiterByUserId,
  getManagerByUserId,
  getRecruitmentStatistics
};
