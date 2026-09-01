const pool = require("../config/db");

const getCandidateByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM candidati WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const getCandidateApplicationsContext = async (candidateId) => {
  const result = await pool.query(
    `SELECT
       a.id_aplicatie,
       a.status,
       a.data_aplicare,

       j.titlu_job,
       j.descriere_job,

       i.data_interviu,
       i.tip_interviu,
       i.link_meeting,
       i.status AS status_interviu

     FROM aplicatii a

     JOIN joburi j ON a.id_job = j.id_job

     LEFT JOIN interviuri i ON a.id_aplicatie = i.id_aplicatie

     WHERE a.id_candidat = $1

     ORDER BY a.data_aplicare DESC`,
    [candidateId]
  );

  return result.rows;
};

const getCandidateNotifications = async (userId) => {
  const result = await pool.query(
    `SELECT tip AS titlu, mesaj, citit, data_trimitere
     FROM notificari
     WHERE id_utilizator = $1
     ORDER BY data_trimitere DESC
     LIMIT 10`,
    [userId]
  );

  return result.rows;
};

module.exports = {
  getCandidateByUserId,
  getCandidateApplicationsContext,
  getCandidateNotifications
};
