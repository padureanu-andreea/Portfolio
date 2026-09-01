const pool = require("../config/db");

const getCompany = async () => {
  const result = await pool.query(
    `SELECT *
     FROM companii
     ORDER BY id_companie ASC
     LIMIT 1`
  );

  return result.rows[0];
};

const createCompany = async ({ nume_companie, cod_fiscal, oras, tara }) => {
  const result = await pool.query(
    `INSERT INTO companii (id_companie, nume_companie, cod_fiscal, oras, tara)
     VALUES (1, $1, $2, $3, $4)
     RETURNING *`,
    [nume_companie, cod_fiscal, oras, tara]
  );

  return result.rows[0];
};

const updateCompany = async ({ nume_companie, cod_fiscal, oras, tara }) => {
  const company = await getCompany();

  if (!company) {
    return null;
  }

  const result = await pool.query(
    `UPDATE companii
     SET nume_companie = $1,
         cod_fiscal = $2,
         oras = $3,
         tara = $4
     WHERE id_companie = $5
     RETURNING *`,
    [nume_companie, cod_fiscal, oras, tara, company.id_companie]
  );

  return result.rows[0];
};

module.exports = {
  getCompany,
  createCompany,
  updateCompany
};