const pool = require("../config/db");

const getApplicationContext = async (applicationId) => {
  const result = await pool.query(
    `SELECT
       a.*,

       j.id_job,
       j.id_recrutor,
       j.id_departament,
       j.titlu_job,
       j.descriere_job,

       c.id_candidat,

       cv.id_cv,
       cv.text_extras_raw

     FROM aplicatii a

     JOIN joburi j
       ON a.id_job = j.id_job

     JOIN candidati c
       ON a.id_candidat = c.id_candidat

     JOIN cv_uri cv
       ON a.id_cv = cv.id_cv

     WHERE a.id_aplicatie = $1`,
    [applicationId]
  );

  return result.rows[0];
};

const getJobById = async (jobId) => {
  const result = await pool.query(
    "SELECT * FROM joburi WHERE id_job = $1",
    [jobId]
  );

  return result.rows[0];
};

const getUnscoredApplicationsByJob = async (jobId) => {
  const result = await pool.query(
    `SELECT
       a.*,

       j.id_job,
       j.id_recrutor,
       j.id_departament,
       j.titlu_job,
       j.descriere_job,

       c.id_candidat,

       cv.id_cv,
       cv.text_extras_raw

     FROM aplicatii a

     JOIN joburi j
       ON a.id_job = j.id_job

     JOIN candidati c
       ON a.id_candidat = c.id_candidat

     JOIN cv_uri cv
       ON a.id_cv = cv.id_cv

     WHERE a.id_job = $1
       AND a.scor_compatibilitate IS NULL
       AND a.status NOT IN ('RETRASA', 'RESPINSA', 'ACCEPTATA')

     ORDER BY a.data_aplicare ASC`,
    [jobId]
  );

  return result.rows;
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

const getJobSkills = async (jobId) => {
  const result = await pool.query(
    `SELECT
       jc.id_competenta,
       c.nume_competenta,
       jc.este_obligatoriu,
       jc.prioritate
     FROM job_competente jc
     JOIN competente c ON jc.id_competenta = c.id_competenta
     WHERE jc.id_job = $1`,
    [jobId]
  );

  return result.rows;
};

const getCvSkills = async (cvId) => {
  const result = await pool.query(
    `SELECT
       cc.id_competenta,
       c.nume_competenta,
       cc.ani_experienta,
       cc.nivel_competenta,
       cc.confidence_score
     FROM cv_competente cc
     JOIN competente c ON cc.id_competenta = c.id_competenta
     WHERE cc.id_cv = $1`,
    [cvId]
  );

  return result.rows;
};

const getCandidateProfile = async (candidateId) => {
  const result = await pool.query(
    `SELECT *
     FROM profil_candidat
     WHERE id_candidat = $1`,
    [candidateId]
  );

  return result.rows[0];
};

const getScoringConfig = async (jobId) => {
  const result = await pool.query(
    `SELECT *
     FROM job_scoring_config
     WHERE id_job = $1`,
    [jobId]
  );

  return result.rows[0];
};

const updateApplicationScore = async (applicationId, scores) => {
  const result = await pool.query(
    `UPDATE aplicatii
     SET
       scor_compatibilitate = $1,
       hard_skills_score = $2,
       soft_skills_score = $3,
       experience_score = $4,
       projects_score = $5,
       education_score = $6,
       volunteering_score = $7,
       competente_lipsa = $8,
       rezumat_ai = $9,
       status = 'IN_ANALIZA'
     WHERE id_aplicatie = $10
     RETURNING *`,
    [
      scores.finalScore,
      scores.hardSkillsScore,
      scores.softSkillsScore,
      scores.experienceScore,
      scores.projectsScore,
      scores.educationScore,
      scores.volunteeringScore,
      scores.missingSkills,
      scores.explanation,
      applicationId
    ]
  );

  return result.rows[0];
};

module.exports = {
  getApplicationContext,
  getJobById,
  getUnscoredApplicationsByJob,
  getRecruiterByUserId,
  getManagerByUserId,
  getJobSkills,
  getCvSkills,
  getCandidateProfile,
  getScoringConfig,
  updateApplicationScore
};
