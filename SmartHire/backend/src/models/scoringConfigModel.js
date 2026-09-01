const pool =
  require("../config/db");

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

const getConfigByJobId = async (jobId) => {

  const result = await pool.query(
    `SELECT *
     FROM job_scoring_config
     WHERE id_job = $1`,
    [jobId]
  );

  return result.rows[0];
};

const createConfig = async (
  jobId,
  profile,
  weights
) => {

  const result = await pool.query(

    `INSERT INTO job_scoring_config
    (
      id_job,
      profil_job,

      hard_skills_weight,
      soft_skills_weight,
      experience_weight,
      projects_weight,
      education_weight,
      volunteering_weight,

      metoda_calcul
    )

    VALUES
    (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9
    )

    RETURNING *`,

    [
      jobId,
      profile,

      weights.hard_skills_weight,
      weights.soft_skills_weight,
      weights.experience_weight,
      weights.projects_weight,
      weights.education_weight,
      weights.volunteering_weight,

      "AHP_ADAPTIVE"
    ]
  );

  return result.rows[0];
};

const updateConfig = async (
  jobId,
  data
) => {

  const {

    hard_skills_weight,
    soft_skills_weight,
    experience_weight,
    projects_weight,
    education_weight,
    volunteering_weight

  } = data;

  const result = await pool.query(

    `UPDATE job_scoring_config

     SET

       hard_skills_weight = $1,
       soft_skills_weight = $2,
       experience_weight = $3,
       projects_weight = $4,
       education_weight = $5,
       volunteering_weight = $6,

       metoda_calcul = 'CUSTOM'

     WHERE id_job = $7

     RETURNING *`,

    [

      hard_skills_weight,
      soft_skills_weight,
      experience_weight,
      projects_weight,
      education_weight,
      volunteering_weight,

      jobId
    ]
  );

  return result.rows[0];
};

module.exports = {

  getJobById,
  getRecruiterByUserId,
  getManagerByUserId,
  getConfigByJobId,
  createConfig,
  updateConfig
};
