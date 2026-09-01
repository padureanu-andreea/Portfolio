const pool = require("../config/db");
const USER_ROLES = require("../constants/userRoles");

const createUser = async ({
  nume,
  prenume,
  email,
  telefon,
  parola_hash,
  rol,
  id_departament
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `INSERT INTO utilizatori
       (
         nume,
         prenume,
         email,
         telefon,
         parola_hash,
         rol
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        nume,
        prenume,
        email,
        telefon || null,
        parola_hash,
        rol
      ]
    );

    const user = userResult.rows[0];

    const companyResult = await client.query(
      `SELECT id_companie FROM companii ORDER BY id_companie ASC LIMIT 1`
    );

    const company = companyResult.rows[0];

    if (rol !== USER_ROLES.ADMIN && !company) {
      const error = new Error(
        "Compania trebuie configurata inainte de a crea conturi"
      );

      error.statusCode = 400;

      throw error;
    }

    if (rol === USER_ROLES.CANDIDAT) {
      await client.query(
        `INSERT INTO candidati
         (
           id_utilizator,
           disponibilitate
         )
         VALUES ($1, $2)`,
        [
          user.id_utilizator,
          true
        ]
      );
    }

    if (rol === USER_ROLES.RECRUTOR) {
      await client.query(
        `INSERT INTO recrutori
         (
           id_utilizator,
           id_companie,
           id_departament,
           functie
         )
         VALUES ($1, $2, $3, $4)`,
        [
          user.id_utilizator,
          company?.id_companie || null,
          id_departament,
          "Recruiter"
        ]
      );
    }

    if (rol === USER_ROLES.MANAGER) {
      await client.query(
        `INSERT INTO manageri
         (
           id_utilizator,
           id_departament,
           functie
         )
         VALUES ($1, $2, $3)`,
        [
          user.id_utilizator,
          id_departament,
          "Manager"
        ]
      );
    }

    await client.query("COMMIT");

    return user;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT *
     FROM utilizatori
     WHERE email = $1`,
    [email]
  );

  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail
};
