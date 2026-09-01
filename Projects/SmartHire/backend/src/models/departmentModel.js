const pool = require("../config/db");

const getAllDepartments = async () => {
  const result = await pool.query(
    `SELECT *
     FROM departamente
     ORDER BY nume_departament ASC`
  );

  return result.rows;
};

const getDepartmentById = async (departmentId) => {
  const result = await pool.query(
    `SELECT *
     FROM departamente
     WHERE id_departament = $1`,
    [departmentId]
  );

  return result.rows[0];
};

const createDepartment = async ({ id_companie, nume_departament }) => {
  const result = await pool.query(
    `INSERT INTO departamente (id_companie, nume_departament)
     VALUES ($1, $2)
     RETURNING *`,
    [id_companie, nume_departament]
  );

  return result.rows[0];
};

const updateDepartment = async (departmentId, { nume_departament }) => {
  const result = await pool.query(
    `UPDATE departamente
     SET nume_departament = $1
     WHERE id_departament = $2
     RETURNING *`,
    [nume_departament, departmentId]
  );

  return result.rows[0];
};

const deleteDepartment = async (departmentId) => {
  const result = await pool.query(
    `DELETE FROM departamente
     WHERE id_departament = $1
     RETURNING *`,
    [departmentId]
  );

  return result.rows[0];
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
