const pool = require("../config/db");
const USER_ROLES = require("../constants/userRoles");

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT
       u.id_utilizator,
       u.nume,
       u.prenume,
       u.email,
       u.telefon,
       u.rol,
       u.data_creare,
       COALESCE(r.id_departament, m.id_departament) AS id_departament
     FROM utilizatori u
     LEFT JOIN recrutori r
       ON u.id_utilizator = r.id_utilizator
     LEFT JOIN manageri m
       ON u.id_utilizator = m.id_utilizator
     ORDER BY u.data_creare DESC`
  );

  return result.rows;
};

const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT
       u.id_utilizator,
       u.nume,
       u.prenume,
       u.email,
       u.telefon,
       u.rol,
       u.data_creare,
       COALESCE(r.id_departament, m.id_departament) AS id_departament
     FROM utilizatori u
     LEFT JOIN recrutori r
       ON u.id_utilizator = r.id_utilizator
     LEFT JOIN manageri m
       ON u.id_utilizator = m.id_utilizator
     WHERE u.id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const getProfileById = async (userId) => {
  const result = await pool.query(
    `SELECT
       id_utilizator,
       nume,
       prenume,
       email,
       telefon,
       rol,
       data_creare
     FROM utilizatori
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const updateProfile = async (userId, data) => {
  const { nume, prenume, telefon } = data;

  const result = await pool.query(
    `UPDATE utilizatori
     SET nume = $1,
         prenume = $2,
         telefon = $3
     WHERE id_utilizator = $4
     RETURNING id_utilizator, nume, prenume, email, telefon, rol, data_creare`,
    [nume, prenume, telefon, userId]
  );

  return result.rows[0];
};

const getPasswordHashById = async (userId) => {
  const result = await pool.query(
    `SELECT parola_hash
     FROM utilizatori
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const updatePassword = async (userId, passwordHash) => {
  const result = await pool.query(
    `UPDATE utilizatori
     SET parola_hash = $1
     WHERE id_utilizator = $2
     RETURNING id_utilizator`,
    [passwordHash, userId]
  );

  return result.rows[0];
};

const findUserByEmailExceptId = async (email, userId) => {
  const result = await pool.query(
    `SELECT id_utilizator
     FROM utilizatori
     WHERE email = $1
       AND id_utilizator <> $2`,
    [email, userId]
  );

  return result.rows[0];
};

const getDepartmentById = async (departmentId) => {
  const result = await pool.query(
    `SELECT id_departament
     FROM departamente
     WHERE id_departament = $1`,
    [departmentId]
  );

  return result.rows[0];
};

const updateUser = async (userId, data) => {
  const {
    nume,
    prenume,
    email,
    telefon,
    parola_hash,
    rol,
    id_departament
  } = data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updateFields = [
      "nume = $1",
      "prenume = $2",
      "email = $3",
      "telefon = $4",
      "rol = $5"
    ];

    const values = [
      nume,
      prenume,
      email,
      telefon,
      rol
    ];

    if (parola_hash) {
      updateFields.push(`parola_hash = $${values.length + 1}`);
      values.push(parola_hash);
    }

    values.push(userId);

    const userResult = await client.query(
      `UPDATE utilizatori
       SET ${updateFields.join(", ")}
       WHERE id_utilizator = $${values.length}
       RETURNING id_utilizator, nume, prenume, email, telefon, rol, data_creare`,
      values
    );

    const user = userResult.rows[0];

    if (!user) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `DELETE FROM recrutori
       WHERE id_utilizator = $1`,
      [userId]
    );

    await client.query(
      `DELETE FROM manageri
       WHERE id_utilizator = $1`,
      [userId]
    );

    if (rol === USER_ROLES.RECRUTOR) {
      const companyResult = await client.query(
        `SELECT id_companie
         FROM companii
         ORDER BY id_companie ASC
         LIMIT 1`
      );

      const company = companyResult.rows[0];

      if (!company) {
        const error = new Error(
          "Compania trebuie configurata inainte de a crea conturi"
        );

        error.statusCode = 400;
        throw error;
      }

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
          userId,
          company.id_companie,
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
          userId,
          id_departament,
          "Manager"
        ]
      );
    }

    await client.query("COMMIT");

    return {
      ...user,
      id_departament
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const deleteUser = async (userId) => {
  const result = await pool.query(
    `DELETE FROM utilizatori
     WHERE id_utilizator = $1
     RETURNING id_utilizator, nume, prenume, email, telefon, rol, data_creare`,
    [userId]
  );

  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  getProfileById,
  updateProfile,
  getPasswordHashById,
  updatePassword,
  findUserByEmailExceptId,
  getDepartmentById,
  updateUser,
  deleteUser
};
