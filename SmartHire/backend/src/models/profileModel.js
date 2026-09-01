const pool = require("../config/db");

const getCandidateByUserId = async (userId) => {

  const result = await pool.query(
    `SELECT *
     FROM candidati
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const getProfileByCandidateId = async (candidateId) => {

  const result = await pool.query(
    `SELECT *
     FROM profil_candidat
     WHERE id_candidat = $1`,
    [candidateId]
  );

  return result.rows[0];
};

const createProfile = async (profileData) => {

  const {
    id_candidat,
    rezumat_profesional,
    experienta_text,
    proiecte_text,
    certificari_text,
    voluntariat_text,
    soft_skills_detectate
  } = profileData;

  const result = await pool.query(
    `INSERT INTO profil_candidat
    (
      id_candidat,
      rezumat_profesional,
      experienta_text,
      proiecte_text,
      certificari_text,
      voluntariat_text,
      soft_skills_detectate
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      id_candidat,
      rezumat_profesional,
      experienta_text,
      proiecte_text,
      certificari_text,
      voluntariat_text,
      soft_skills_detectate
    ]
  );

  return result.rows[0];
};

const updateProfile = async (
  candidateId,
  profileData
) => {

  const {
    rezumat_profesional,
    experienta_text,
    proiecte_text,
    certificari_text,
    voluntariat_text,
    soft_skills_detectate
  } = profileData;

  const result = await pool.query(
    `UPDATE profil_candidat
     SET

      rezumat_profesional = $1,
      experienta_text = $2,
      proiecte_text = $3,
      certificari_text = $4,
      voluntariat_text = $5,
      soft_skills_detectate = $6

     WHERE id_candidat = $7

     RETURNING *`,
    [
      rezumat_profesional,
      experienta_text,
      proiecte_text,
      certificari_text,
      voluntariat_text,
      soft_skills_detectate,
      candidateId
    ]
  );

  return result.rows[0];
};

const deleteProfile = async (candidateId) => {

  const result = await pool.query(
    `DELETE FROM profil_candidat
     WHERE id_candidat = $1
     RETURNING *`,
    [candidateId]
  );

  return result.rows[0];
};

module.exports = {
  getCandidateByUserId,
  getProfileByCandidateId,
  createProfile,
  updateProfile,
  deleteProfile
};