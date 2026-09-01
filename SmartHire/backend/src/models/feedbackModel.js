const pool = require("../config/db");

const getInterviewById = async (
  interviewId
) => {

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

const getFeedbackByInterviewId = async (
  interviewId
) => {

  const result = await pool.query(
    `SELECT *
     FROM feedback
     WHERE id_interviu = $1`,
    [interviewId]
  );

  return result.rows[0];
};

const getFeedbackById = async (
  feedbackId
) => {

  const result = await pool.query(
    `SELECT
       f.*,
       a.id_job
     FROM feedback f
     JOIN interviuri i
       ON f.id_interviu = i.id_interviu
     JOIN aplicatii a
       ON i.id_aplicatie = a.id_aplicatie
     WHERE f.id_feedback = $1`,
    [feedbackId]
  );

  return result.rows[0];
};

const createFeedback = async ({
  id_interviu,
  id_autor,
  continut_feedback,
  rating_candidat,
  recomandare_finala
}) => {

  const result = await pool.query(
    `INSERT INTO feedback
    (
      id_interviu,
      id_autor,
      continut_feedback,
      rating_candidat,
      recomandare_finala
    )

    VALUES ($1,$2,$3,$4,$5)

    RETURNING *`,
    [
      id_interviu,
      id_autor,
      continut_feedback,
      rating_candidat,
      recomandare_finala
    ]
  );

  return result.rows[0];
};

const updateFeedback = async (
  feedbackId,
  data
) => {

  const {
    continut_feedback,
    rating_candidat,
    recomandare_finala
  } = data;

  const result = await pool.query(
    `UPDATE feedback

     SET
       continut_feedback = $1,
       rating_candidat = $2,
       recomandare_finala = $3

     WHERE id_feedback = $4

     RETURNING *`,
    [
      continut_feedback,
      rating_candidat,
      recomandare_finala,
      feedbackId
    ]
  );

  return result.rows[0];
};

const deleteFeedback = async (
  feedbackId
) => {

  const result = await pool.query(
    `DELETE FROM feedback
     WHERE id_feedback = $1
     RETURNING *`,
    [feedbackId]
  );

  return result.rows[0];
};

module.exports = {
  getInterviewById,
  getJobById,
  getRecruiterByUserId,
  getManagerByUserId,
  getFeedbackByInterviewId,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback
};
