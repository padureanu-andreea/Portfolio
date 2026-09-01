const pool = require("../config/db");

const getJobById = async (jobId) => {
  const result = await pool.query(
    `SELECT * FROM joburi WHERE id_job = $1`,
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

const getBiasAnalysisByJobId = async (jobId) => {
  const result = await pool.query(
    `SELECT *
     FROM analiza_job
     WHERE id_job = $1`,
    [jobId]
  );

  return result.rows[0];
};

const saveBiasAnalysis = async ({
  id_job,
  has_bias,
  bias_detectat,
  sugestii_reformulare
}) => {
  const existing = await getBiasAnalysisByJobId(id_job);

  if (existing) {
    const result = await pool.query(
      `UPDATE analiza_job
       SET has_bias = $1,
           bias_detectat = $2,
           sugestii_reformulare = $3,
           analysis_needs_update = false
       WHERE id_job = $4
       RETURNING *`,
      [has_bias, bias_detectat, sugestii_reformulare, id_job]
    );

    return result.rows[0];
  }

  const result = await pool.query(
    `INSERT INTO analiza_job
     (id_job, has_bias, bias_detectat, sugestii_reformulare, analysis_needs_update)
     VALUES ($1, $2, $3, $4, false)
     RETURNING *`,
    [id_job, has_bias, bias_detectat, sugestii_reformulare]
  );

  return result.rows[0];
};

const updateJobDescription = async (jobId, newDescription) => {
  const result = await pool.query(
    `UPDATE joburi
     SET descriere_job = $1
     WHERE id_job = $2
     RETURNING *`,
    [newDescription, jobId]
  );

  return result.rows[0];
};

const markBiasAnalysisAccepted = async (jobId) => {
  const result = await pool.query(
    `UPDATE analiza_job
     SET has_bias = false,
         analysis_needs_update = false,
         sugestii_reformulare = $1
     WHERE id_job = $2
     RETURNING *`,
    [
      "Reformularea AI a fost acceptata. Jobul poate fi publicat.",
      jobId
    ]
  );

  return result.rows[0];
};

module.exports = {
  getJobById,
  getRecruiterByUserId,
  getManagerByUserId,
  getBiasAnalysisByJobId,
  saveBiasAnalysis,
  updateJobDescription,
  markBiasAnalysisAccepted,
};
