const pool = require("../config/db");

const getAllSkills = async () => {
  const result = await pool.query(
    `SELECT * FROM competente ORDER BY nume_competenta ASC`
  );
  return result.rows;
};

const getSkillById = async (skillId) => {
  const result = await pool.query(
    `SELECT * FROM competente WHERE id_competenta = $1`,
    [skillId]
  );
  return result.rows[0];
};

const createSkill = async (nume_competenta) => {
  const result = await pool.query(
    `INSERT INTO competente (nume_competenta)
     VALUES ($1)
     RETURNING *`,
    [nume_competenta]
  );
  return result.rows[0];
};

const updateSkill = async (skillId, nume_competenta) => {
  const result = await pool.query(
    `UPDATE competente
     SET nume_competenta = $1
     WHERE id_competenta = $2
     RETURNING *`,
    [nume_competenta, skillId]
  );
  return result.rows[0];
};

const deleteSkill = async (skillId) => {
  const result = await pool.query(
    `DELETE FROM competente
     WHERE id_competenta = $1
     RETURNING *`,
    [skillId]
  );
  return result.rows[0];
};

module.exports = {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
};