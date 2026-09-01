const pool = require("../config/db");

const getJobById = async (jobId) => {
  const result = await pool.query(
    "SELECT * FROM joburi WHERE id_job = $1",
    [jobId]
  );

  return result.rows[0];
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

const getJobRanking = async (jobId) => {
  const result = await pool.query(
    `SELECT
       a.id_aplicatie,
       a.id_job,
       a.id_candidat,
       a.id_cv,
       a.status,
       a.data_aplicare,

       a.scor_compatibilitate,
       a.hard_skills_score,
       a.soft_skills_score,
       a.experience_score,
       a.projects_score,
       a.education_score,
       a.volunteering_score,

       a.competente_lipsa,
       a.rezumat_ai,

       u.nume,
       u.prenume,
       u.email,

       cv.nume_fisier

     FROM aplicatii a

     JOIN candidati c
       ON a.id_candidat = c.id_candidat

     JOIN utilizatori u
       ON c.id_utilizator = u.id_utilizator

     JOIN cv_uri cv
       ON a.id_cv = cv.id_cv

     WHERE a.id_job = $1
       AND a.status <> 'RETRASA'

     ORDER BY
       a.scor_compatibilitate DESC NULLS LAST,
       a.data_aplicare ASC`,
    [jobId]
  );

  return result.rows;
};

const getApplicationAnalysis = async (applicationId) => {
  const result = await pool.query(
    `SELECT
       a.id_aplicatie,
       a.id_job,
       a.id_candidat,
       a.id_cv,
       a.status,
       a.data_aplicare,

       a.scor_compatibilitate,
       a.hard_skills_score,
       a.soft_skills_score,
       a.experience_score,
       a.projects_score,
       a.education_score,
       a.volunteering_score,

       a.competente_lipsa,
       a.rezumat_ai,

       j.titlu_job,
       j.descriere_job,
       j.id_recrutor,
       j.id_departament,


       u.nume,
       u.prenume,
       u.email,

       cv.nume_fisier,
       cv.text_extras_raw

     FROM aplicatii a

     JOIN joburi j
       ON a.id_job = j.id_job

     JOIN candidati c
       ON a.id_candidat = c.id_candidat

     JOIN utilizatori u
       ON c.id_utilizator = u.id_utilizator

     JOIN cv_uri cv
       ON a.id_cv = cv.id_cv

     WHERE a.id_aplicatie = $1`,
    [applicationId]
  );

  return result.rows[0];
};

module.exports = {
  getJobById,
  getRecruiterByUserId,
  getManagerByUserId,
  getJobRanking,
  getApplicationAnalysis
};
