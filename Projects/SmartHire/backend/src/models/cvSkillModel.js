const pool = require("../config/db");

const getCvById = async (cvId) => {

  const result = await pool.query(
    `SELECT *
     FROM cv_uri
     WHERE id_cv = $1`,
    [cvId]
  );

  return result.rows[0];
};

const getSkillById = async (skillId) => {

  const result = await pool.query(
    `SELECT *
     FROM competente
     WHERE id_competenta = $1`,
    [skillId]
  );

  return result.rows[0];
};

const getCandidateByUserId = async (userId) => {

  const result = await pool.query(
    `SELECT *
     FROM candidati
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const getRecruiterByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT *
     FROM recrutori
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const getManagerByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT *
     FROM manageri
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const cvHasApplicationInDepartment = async (cvId, departmentId) => {
  const result = await pool.query(
    `SELECT a.id_aplicatie
     FROM aplicatii a
     JOIN joburi j
       ON a.id_job = j.id_job
     WHERE a.id_cv = $1
       AND j.id_departament = $2
     LIMIT 1`,
    [cvId, departmentId]
  );

  return Boolean(result.rows[0]);
};

const addSkillToCv = async (cvId, skillData) => {

  const {
    id_competenta,
    ani_experienta,
    nivel_competenta,
    confidence_score
  } = skillData;

  const result = await pool.query(
    `INSERT INTO cv_competente
    (
      id_cv,
      id_competenta,
      ani_experienta,
      nivel_competenta,
      confidence_score
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      cvId,
      id_competenta,
      ani_experienta,
      nivel_competenta,
      confidence_score
    ]
  );

  return result.rows[0];
};

const getCvSkills = async (cvId) => {

  const result = await pool.query(
    `SELECT

      cvc.id_cv,
      cvc.id_competenta,

      c.nume_competenta,

      cvc.ani_experienta,
      cvc.nivel_competenta,
      cvc.confidence_score

     FROM cv_competente cvc

     JOIN competente c
     ON cvc.id_competenta = c.id_competenta

     WHERE cvc.id_cv = $1

     ORDER BY
     cvc.nivel_competenta DESC,
     cvc.ani_experienta DESC`,
    [cvId]
  );

  return result.rows;
};

const removeSkillFromCv = async (cvId, skillId) => {

  const result = await pool.query(
    `DELETE FROM cv_competente
     WHERE id_cv = $1
     AND id_competenta = $2
     RETURNING *`,
    [cvId, skillId]
  );

  return result.rows[0];
};

module.exports = {
  getCvById,
  getSkillById,
  getCandidateByUserId,
  getRecruiterByUserId,
  getManagerByUserId,
  cvHasApplicationInDepartment,
  addSkillToCv,
  getCvSkills,
  removeSkillFromCv
};