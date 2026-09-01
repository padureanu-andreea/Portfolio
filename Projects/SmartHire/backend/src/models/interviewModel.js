const pool = require("../config/db");

const getApplicationById = async (applicationId) => {
  const result = await pool.query(
    `SELECT *
     FROM aplicatii
     WHERE id_aplicatie = $1`,
    [applicationId]
  );

  return result.rows[0];
};

const getJobById = async (jobId) => {
  const result = await pool.query(
    `SELECT *
     FROM joburi
     WHERE id_job = $1`,
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

const getInterviewById = async (interviewId) => {
  const result = await pool.query(
    `SELECT
       i.*,
       a.id_job
     FROM interviuri i
     JOIN aplicatii a
       ON i.id_aplicatie = a.id_aplicatie
     WHERE i.id_interviu = $1`,
    [interviewId]
  );

  return result.rows[0];
};

const createInterview = async ({
  id_aplicatie,
  id_organizator,
  data_interviu,
  tip_interviu,
  link_meeting,
  status
}) => {

  const result = await pool.query(
    `INSERT INTO interviuri
    (
      id_aplicatie,
      id_organizator,
      data_interviu,
      tip_interviu,
      link_meeting,
      status
    )

    VALUES ($1,$2,$3,$4,$5,$6)

    RETURNING *`,
    [
      id_aplicatie,
      id_organizator,
      data_interviu,
      tip_interviu,
      link_meeting,
      status
    ]
  );

  return result.rows[0];
};

const updateInterview = async (
  interviewId,
  data
) => {

  const {
    data_interviu,
    tip_interviu,
    link_meeting,
    status
  } = data;

  const result = await pool.query(
    `UPDATE interviuri

     SET
       data_interviu = COALESCE($1, data_interviu),
       tip_interviu = COALESCE($2, tip_interviu),
       link_meeting = COALESCE($3, link_meeting),
       status = COALESCE($4, status)

     WHERE id_interviu = $5

     RETURNING *`,
    [
      data_interviu,
      tip_interviu,
      link_meeting,
      status,
      interviewId
    ]
  );

  return result.rows[0];
};

const deleteInterview = async (
  interviewId
) => {

  const result = await pool.query(
    `DELETE FROM interviuri
     WHERE id_interviu = $1
     RETURNING *`,
    [interviewId]
  );

  return result.rows[0];
};

const getJobInterviews = async (
  jobId
) => {

  const result = await pool.query(
    `SELECT

       i.*,

       a.id_job,

       u.nume,
       u.prenume,
       u.email,
       u.telefon,

       ou.nume AS organizator_nume,
       ou.prenume AS organizator_prenume,
       ou.email AS organizator_email,

       f.id_feedback,
       f.id_autor AS feedback_id_autor,
       f.continut_feedback AS feedback_continut_feedback,
       f.rating_candidat AS feedback_rating_candidat,
       f.recomandare_finala AS feedback_recomandare_finala,
       f.data_feedback AS feedback_data_feedback

     FROM interviuri i

     JOIN aplicatii a
       ON i.id_aplicatie = a.id_aplicatie

     JOIN candidati c
       ON a.id_candidat = c.id_candidat

     JOIN utilizatori u
       ON c.id_utilizator = u.id_utilizator

     LEFT JOIN utilizatori ou
       ON i.id_organizator = ou.id_utilizator

     LEFT JOIN feedback f
       ON f.id_interviu = i.id_interviu

     WHERE a.id_job = $1

     ORDER BY i.data_interviu ASC`,
    [jobId]
  );

  return result.rows;
};

const getCandidateInterviews = async (
  candidateId
) => {

  const result = await pool.query(
    `SELECT

       i.*,

       a.id_job,
       a.status AS status_aplicatie,

       j.titlu_job,

       u.nume AS organizator_nume,
       u.prenume AS organizator_prenume,
       u.email AS organizator_email

     FROM interviuri i

     JOIN aplicatii a
       ON i.id_aplicatie = a.id_aplicatie

     JOIN joburi j
       ON a.id_job = j.id_job

     LEFT JOIN utilizatori u
       ON i.id_organizator = u.id_utilizator

     WHERE a.id_candidat = $1

     ORDER BY i.data_interviu DESC`,
    [candidateId]
  );

  return result.rows;
};

const getCandidateUserIdByApplication = async (applicationId) => {
  const result = await pool.query(
    `SELECT c.id_utilizator
     FROM aplicatii a
     JOIN candidati c
       ON a.id_candidat = c.id_candidat
     WHERE a.id_aplicatie = $1`,
    [applicationId]
  );

  return result.rows[0]?.id_utilizator;
};

const getCandidateByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id_candidat
     FROM candidati
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const updateApplicationStatus = async (applicationId, status) => {
  const result = await pool.query(
    `UPDATE aplicatii
     SET status = $1
     WHERE id_aplicatie = $2
     RETURNING *`,
    [status, applicationId]
  );

  return result.rows[0];
};

const getApplicationInterviews = async (applicationId) => {
  const result = await pool.query(
    `SELECT *
     FROM interviuri
     WHERE id_aplicatie = $1`,
    [applicationId]
  );

  return result.rows;
};

const getApplicationNotificationContext = async (applicationId) => {
  const result = await pool.query(
    `SELECT
       a.id_aplicatie,
       j.titlu_job,
       u.nume,
       u.prenume
     FROM aplicatii a
     JOIN joburi j
       ON a.id_job = j.id_job
     JOIN candidati c
       ON a.id_candidat = c.id_candidat
     JOIN utilizatori u
       ON c.id_utilizator = u.id_utilizator
     WHERE a.id_aplicatie = $1`,
    [applicationId]
  );

  return result.rows[0];
};

const getOrganizerInterviewConflict = async ({
  organizerId,
  interviewDate,
  excludedInterviewId = null
}) => {
  const result = await pool.query(
    `SELECT *
     FROM interviuri
     WHERE id_organizator = $1
       AND status IN ('PROGRAMAT', 'REPROGRAMARE_SOLICITATA')
       AND ($3::int IS NULL OR id_interviu <> $3)
       AND ABS(EXTRACT(EPOCH FROM (data_interviu - $2::timestamp))) < 3600
     ORDER BY data_interviu ASC
     LIMIT 1`,
    [
      organizerId,
      interviewDate,
      excludedInterviewId
    ]
  );

  return result.rows[0];
};

const getManagerUserIdByDepartmentId = async (departmentId) => {
  const result = await pool.query(
    `SELECT id_utilizator
     FROM manageri
     WHERE id_departament = $1
     LIMIT 1`,
    [departmentId]
  );

  return result.rows[0]?.id_utilizator;
};

const updateInterviewStatus = async (interviewId, status) => {
  const result = await pool.query(
    `UPDATE interviuri
     SET status = $1
     WHERE id_interviu = $2
     RETURNING *`,
    [status, interviewId]
  );

  return result.rows[0];
};

module.exports = {
  getApplicationById,
  updateApplicationStatus,
  getApplicationInterviews,
  getJobById,
  getRecruiterByUserId,
  getManagerByUserId,
  getManagerUserIdByDepartmentId,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  getJobInterviews,
  getCandidateInterviews,
  getCandidateUserIdByApplication,
  getCandidateByUserId,
  getApplicationNotificationContext,
  getOrganizerInterviewConflict,
  updateInterviewStatus
};
