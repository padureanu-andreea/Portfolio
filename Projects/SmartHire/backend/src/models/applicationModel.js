const pool = require("../config/db");

const getCandidateByUserId = async (userId) => {
  const result = await pool.query(
    "SELECT id_candidat FROM candidati WHERE id_utilizator = $1",
    [userId]
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

const getJobById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM joburi WHERE id_job = $1",
    [id]
  );

  return result.rows[0];
};

const getCvById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM cv_uri WHERE id_cv = $1",
    [id]
  );

  return result.rows[0];
};

const getApplicationByCandidateAndJob = async (candidateId, jobId) => {
  const result = await pool.query(
    `SELECT *
     FROM aplicatii
     WHERE id_candidat = $1
       AND id_job = $2`,
    [candidateId, jobId]
  );

  return result.rows[0];
};

const createApplication = async (data) => {
  const {
    id_candidat,
    id_job,
    id_cv
  } = data;

  const result = await pool.query(
    `INSERT INTO aplicatii
    (id_candidat, id_job, id_cv, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [
      id_candidat,
      id_job,
      id_cv,
      "DEPUSA"
    ]
  );

  return result.rows[0];
};

const getApplicationsByCandidate = async (id_candidat) => {
  const result = await pool.query(
    `SELECT 
      a.*,
      j.titlu_job
    FROM aplicatii a
    JOIN joburi j ON a.id_job = j.id_job
    WHERE a.id_candidat = $1
    ORDER BY a.data_aplicare DESC`,
    [id_candidat]
  );

  return result.rows;
};

const getApplicationsByJob = async (id_job) => {
  const result = await pool.query(
    `SELECT 
      a.*,
      u.nume,
      u.prenume,
      u.email,
      u.telefon,
      EXISTS (
        SELECT 1
        FROM interviuri i
        WHERE i.id_aplicatie = a.id_aplicatie
          AND i.tip_interviu IN ('HR_ONLINE', 'HR_FIZIC', 'HR_TELEFONIC')
          AND i.status = 'FINALIZAT'
      ) AS has_hr_finalized,
      EXISTS (
        SELECT 1
        FROM interviuri i
        WHERE i.id_aplicatie = a.id_aplicatie
          AND i.tip_interviu IN ('TEHNIC_ONLINE', 'TEHNIC_FIZIC')
      ) AS has_technical_interview,
      EXISTS (
        SELECT 1
        FROM interviuri i
        WHERE i.id_aplicatie = a.id_aplicatie
          AND i.tip_interviu IN ('TEHNIC_ONLINE', 'TEHNIC_FIZIC')
          AND i.status IN ('PROGRAMAT', 'REPROGRAMARE_SOLICITATA')
      ) AS has_active_technical_interview
    FROM aplicatii a
    JOIN candidati c ON a.id_candidat = c.id_candidat
    JOIN utilizatori u ON c.id_utilizator = u.id_utilizator
    WHERE a.id_job = $1
    ORDER BY a.data_aplicare DESC`,
    [id_job]
  );

  return result.rows;
};

const getApplicationById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM aplicatii WHERE id_aplicatie = $1",
    [id]
  );

  return result.rows[0];
};

const updateApplicationStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE aplicatii
     SET status = $1
     WHERE id_aplicatie = $2
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
};

const cancelProgrammedInterviewsByApplication = async (applicationId) => {
  const result = await pool.query(
    `UPDATE interviuri
     SET status = 'ANULAT'
     WHERE id_aplicatie = $1
       AND status IN ('PROGRAMAT', 'REPROGRAMARE_SOLICITATA')
     RETURNING *`,
    [applicationId]
  );

  return result.rows;
};

const getCandidateUserId = async (candidateId) => {
  const result = await pool.query(
    `SELECT id_utilizator
     FROM candidati
     WHERE id_candidat = $1`,
    [candidateId]
  );

  return result.rows[0]?.id_utilizator;
};

const getRecruiterUserIdByJobId = async (jobId) => {
  const result = await pool.query(
    `SELECT r.id_utilizator
     FROM joburi j
     JOIN recrutori r ON j.id_recrutor = r.id_recrutor
     WHERE j.id_job = $1`,
    [jobId]
  );

  return result.rows[0]?.id_utilizator;
};

const getApplicationDetailsForCandidate = async (applicationId) => {
  const result = await pool.query(
    `SELECT
       a.id_aplicatie,
       a.id_candidat,
       a.id_job,
       a.id_cv,
       a.status,
       a.data_aplicare,
       a.scor_compatibilitate,
       a.competente_lipsa,
       a.rezumat_ai,

       j.titlu_job,
       j.descriere_job,
       j.salariu_minim,
       j.salariu_maxim,
       j.id_departament,
       j.id_recrutor,

       cv.nume_fisier,

       u.nume,
       u.prenume,
       u.email,
       u.telefon

     FROM aplicatii a
     JOIN joburi j ON a.id_job = j.id_job
     LEFT JOIN cv_uri cv ON a.id_cv = cv.id_cv
     JOIN candidati c ON a.id_candidat = c.id_candidat
     JOIN utilizatori u ON c.id_utilizator = u.id_utilizator
     WHERE a.id_aplicatie = $1`,
    [applicationId]
  );

  return result.rows[0];
};

const getApplicationInterviews = async (applicationId) => {
  const result = await pool.query(
    `SELECT
       i.*,
       u.nume AS organizator_nume,
       u.prenume AS organizator_prenume,
       u.email AS organizator_email,

       f.id_feedback,
       f.id_autor AS feedback_id_autor,
       f.continut_feedback AS feedback_continut_feedback,
       f.rating_candidat AS feedback_rating_candidat,
       f.recomandare_finala AS feedback_recomandare_finala,
       f.data_feedback AS feedback_data_feedback
     FROM interviuri i
     LEFT JOIN utilizatori u ON i.id_organizator = u.id_utilizator
     LEFT JOIN feedback f ON f.id_interviu = i.id_interviu
     WHERE i.id_aplicatie = $1
     ORDER BY i.data_interviu ASC`,
    [applicationId]
  );

  return result.rows;
};

module.exports = {
  getCandidateByUserId,
   getRecruiterByUserId,
  getManagerByUserId,
  getJobById,
  getCvById,
  getApplicationByCandidateAndJob,
  createApplication,
  getApplicationsByCandidate,
  getApplicationsByJob,
  getApplicationById,
  updateApplicationStatus,
  cancelProgrammedInterviewsByApplication,
  getCandidateUserId,
  getRecruiterUserIdByJobId,
  getApplicationDetailsForCandidate,
  getApplicationInterviews
};
