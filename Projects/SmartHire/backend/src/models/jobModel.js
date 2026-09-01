const pool = require("../config/db");

const JOB_STATUS = require("../constants/jobStatus");

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

const getAllJobs = async () => {
  const result = await pool.query(`
    SELECT 
      j.*,
      d.nume_departament
    FROM joburi j
    LEFT JOIN departamente d ON j.id_departament = d.id_departament
    ORDER BY j.data_publicare DESC
  `);

  return result.rows;
};

const getJobsForCandidate = async () => {
  const result = await pool.query(`
    SELECT 
      j.*,
      d.nume_departament
    FROM joburi j
    LEFT JOIN departamente d ON j.id_departament = d.id_departament
    WHERE j.status = 'ACTIV'
    ORDER BY j.data_publicare DESC
  `);

  return result.rows;
};

const getJobsForRecruiter = async (userId) => {
  const result = await pool.query(
    `SELECT 
       j.*,
       d.nume_departament
     FROM joburi j
     LEFT JOIN departamente d
       ON j.id_departament = d.id_departament
     JOIN recrutori r
       ON j.id_recrutor = r.id_recrutor
     WHERE r.id_utilizator = $1
       AND j.id_departament = r.id_departament
     ORDER BY j.data_publicare DESC`,
    [userId]
  );

  return result.rows;
};

const getJobsForManager = async (userId) => {
  const result = await pool.query(
    `SELECT 
       j.*,
       d.nume_departament
     FROM joburi j
     LEFT JOIN departamente d ON j.id_departament = d.id_departament
     JOIN manageri m ON j.id_departament = m.id_departament
     WHERE m.id_utilizator = $1
     ORDER BY j.data_publicare DESC`,
    [userId]
  );

  return result.rows;
};

const getJobById = async (id) => {
  const result = await pool.query(
    `SELECT
       j.*,
       d.nume_departament
     FROM joburi j
     LEFT JOIN departamente d
       ON j.id_departament = d.id_departament
     WHERE j.id_job = $1`,
    [id]
  );

  return result.rows[0];
};

const getJobSkillsCount = async (jobId) => {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM job_competente
     WHERE id_job = $1`,
    [jobId]
  );

  return result.rows[0].count;
};

const createJob = async (data) => {
  const {
    id_departament,
    id_recrutor,
    titlu_job,
    descriere_job,
    salariu_minim,
    salariu_maxim,
    tara,
    oras,
    mod_lucru,
    status = JOB_STATUS.DRAFT
  } = data;

  const result = await pool.query(
    `INSERT INTO joburi
     (
       id_departament,
       id_recrutor,
       titlu_job,
       descriere_job,
       salariu_minim,
       salariu_maxim,
       tara,
       oras,
       mod_lucru,
       status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      id_departament,
      id_recrutor,
      titlu_job,
      descriere_job,
      salariu_minim,
      salariu_maxim,
      tara,
      oras,
      mod_lucru,
      status
    ]
  );

  return result.rows[0];
};

const updateJob = async (id, data) => {
  const {
    id_departament,
    titlu_job,
    descriere_job,
    salariu_minim,
    salariu_maxim,
    tara,
    oras,
    mod_lucru,
    status
  } = data;

const result = await pool.query(
  `UPDATE joburi
   SET 
     id_departament = COALESCE($1, id_departament),
     titlu_job = COALESCE($2, titlu_job),
     descriere_job = COALESCE($3, descriere_job),
     salariu_minim = COALESCE($4, salariu_minim),
     salariu_maxim = COALESCE($5, salariu_maxim),
     tara = COALESCE($6, tara),
     oras = COALESCE($7, oras),
     mod_lucru = COALESCE($8, mod_lucru),
     status = COALESCE($9, status)
   WHERE id_job = $10
   RETURNING *`,
  [
    id_departament,
    titlu_job,
    descriere_job,
    salariu_minim,
    salariu_maxim,
    tara,
    oras,
    mod_lucru,
    status,
    id
  ]
);

  return result.rows[0];
};

const deleteJob = async (id) => {
  const result = await pool.query(
    "DELETE FROM joburi WHERE id_job = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

const updateJobStatus = async (jobId, status) => {
  const result = await pool.query(
    `UPDATE joburi
     SET status = $1
     WHERE id_job = $2
     RETURNING *`,
    [status, jobId]
  );

  return result.rows[0];
};

const getBiasAnalysisByJobId = async (jobId) => {
  const result = await pool.query(
    `SELECT *
     FROM analiza_job
     WHERE id_job = $1`,
    [jobId]
  );

  return result.rows[0];
};

const markBiasAnalysisNeedsUpdate = async (jobId) => {
  await pool.query(
    `UPDATE analiza_job
     SET analysis_needs_update = true,
         sugestii_reformulare = $1
     WHERE id_job = $2`,
    [
      "Descrierea jobului a fost modificata dupa analiza. Ruleaza analiza AI din nou.",
      jobId
    ]
  );
};

module.exports = {
  getRecruiterByUserId,
  getManagerByUserId,
  getAllJobs,
  getJobsForCandidate,
  getJobsForRecruiter,
  getJobsForManager,
  getJobById,
  getJobSkillsCount,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getBiasAnalysisByJobId,
  markBiasAnalysisNeedsUpdate
};
