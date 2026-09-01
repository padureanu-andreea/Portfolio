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

const getSkillById = async (skillId) => {
  const result = await pool.query(
    "SELECT * FROM competente WHERE id_competenta = $1",
    [skillId]
  );

  return result.rows[0];
};

const getSkillByName = async (skillName) => {
  const result = await pool.query(
    `SELECT *
     FROM competente
     WHERE LOWER(nume_competenta) = LOWER($1)`,
    [skillName]
  );

  return result.rows[0];
};

const createSkill = async (skillName) => {
  const result = await pool.query(
    `INSERT INTO competente (nume_competenta)
     VALUES ($1)
     RETURNING *`,
    [skillName]
  );

  return result.rows[0];
};

const findOrCreateSkillByName = async (skillName) => {
  const existingSkill = await getSkillByName(skillName);

  if (existingSkill) {
    return existingSkill;
  }

  try {
    return await createSkill(skillName);
  } catch (err) {
    if (err.code === "23505") {
      return getSkillByName(skillName);
    }

    throw err;
  }
};

const addSkillToJob = async (jobId, skillData) => {
  const { id_competenta, este_obligatoriu, prioritate } = skillData;

  const result = await pool.query(
    `INSERT INTO job_competente
     (id_job, id_competenta, este_obligatoriu, prioritate)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [jobId, id_competenta, este_obligatoriu, prioritate]
  );

  return result.rows[0];
};

const getJobSkills = async (jobId) => {
  const result = await pool.query(
    `SELECT 
       jc.id_job,
       jc.id_competenta,
       c.nume_competenta,
       jc.este_obligatoriu,
       jc.prioritate
     FROM job_competente jc
     JOIN competente c ON jc.id_competenta = c.id_competenta
     WHERE jc.id_job = $1
     ORDER BY jc.este_obligatoriu DESC, jc.prioritate DESC`,
    [jobId]
  );

  return result.rows;
};

const updateJobSkill = async (jobId, skillId, data) => {
  const { este_obligatoriu, prioritate } = data;

  const result = await pool.query(
    `UPDATE job_competente
     SET este_obligatoriu = $1,
         prioritate = $2
     WHERE id_job = $3
       AND id_competenta = $4
     RETURNING *`,
    [este_obligatoriu, prioritate, jobId, skillId]
  );

  return result.rows[0];
};

const removeSkillFromJob = async (jobId, skillId) => {
  const result = await pool.query(
    `DELETE FROM job_competente
     WHERE id_job = $1 AND id_competenta = $2
     RETURNING *`,
    [jobId, skillId]
  );

  return result.rows[0];
};

module.exports = {
  getJobById,
  getRecruiterByUserId,
  getSkillById,
  getSkillByName,
  createSkill,
  findOrCreateSkillByName,
  addSkillToJob,
  getJobSkills,
  updateJobSkill,
  removeSkillFromJob
};
