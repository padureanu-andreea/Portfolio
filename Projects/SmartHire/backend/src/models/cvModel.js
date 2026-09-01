// src/models/cvModel.js

const pool =
  require("../config/db");

const getCandidateByUserId = async (
  userId
) => {

  const result = await pool.query(

    `SELECT *
     FROM candidati
     WHERE id_utilizator = $1`,

    [userId]
  );

  return result.rows[0];
};

const createCv = async ({
  id_candidat,
  nume_fisier,
  cale_fisier
}) => {

  const result = await pool.query(

    `INSERT INTO cv_uri
    (
      id_candidat,
      nume_fisier,
      cale_fisier
    )

    VALUES ($1,$2,$3)

    RETURNING *`,

    [
      id_candidat,
      nume_fisier,
      cale_fisier
    ]
  );

  return result.rows[0];
};

const getCvsByCandidate = async (
  candidateId
) => {

  const result = await pool.query(

    `SELECT *
     FROM cv_uri
     WHERE id_candidat = $1
     ORDER BY data_incarcare DESC`,

    [candidateId]
  );

  return result.rows;
};

const getCvById = async (
  cvId
) => {

  const result = await pool.query(

    `SELECT *
     FROM cv_uri
     WHERE id_cv = $1`,

    [cvId]
  );

  return result.rows[0];
};

const deleteCv = async (
  cvId
) => {

  const result = await pool.query(

    `DELETE FROM cv_uri
     WHERE id_cv = $1
     RETURNING *`,

    [cvId]
  );

  return result.rows[0];
};

const cvHasApplications = async (
  cvId
) => {

  const result = await pool.query(

    `SELECT id_aplicatie
     FROM aplicatii
     WHERE id_cv = $1
     LIMIT 1`,

    [cvId]
  );

  return Boolean(result.rows[0]);
};

const updateExtractedText = async (
  cvId,
  extractedText
) => {

  const result = await pool.query(

    `UPDATE cv_uri

     SET text_extras_raw = $1

     WHERE id_cv = $2

     RETURNING *`,

    [
      extractedText,
      cvId
    ]
  );

  return result.rows[0];
};

const getSkillByName = async (
  skillName
) => {

  const result = await pool.query(

    `SELECT *
     FROM competente
     WHERE LOWER(nume_competenta) =
           LOWER($1)`,

    [skillName]
  );

  return result.rows[0];
};

const createSkill = async (
  skillName
) => {

  const result = await pool.query(

    `INSERT INTO competente
     (nume_competenta)

     VALUES ($1)

     RETURNING *`,

    [skillName]
  );

  return result.rows[0];
};

const addSkillToCv = async ({
  id_cv,
  id_competenta,
  ani_experienta,
  nivel_competenta,
  confidence_score
}) => {
  await pool.query(
    `INSERT INTO cv_competente
     (
       id_cv,
       id_competenta,
       ani_experienta,
       nivel_competenta,
       confidence_score
     )
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT DO NOTHING`,
    [
      id_cv,
      id_competenta,
      ani_experienta,
      nivel_competenta,
      confidence_score
    ]
  );
};

const createOrUpdateProfile = async ({
  id_candidat,
  professionalSummary,
  experienceSummary,
  projectsSummary,
  educationSummary,
  certificationsSummary,
  volunteeringSummary,
  softSkills,
  extractedText
}) => {

  const normalizedSoftSkills =
    Array.isArray(softSkills)
      ? softSkills
          .map((skill) =>
            typeof skill === "string"
              ? skill
              : skill.name
          )
          .filter(Boolean)
          .join(", ")
      : softSkills || "";

  const normalizedProfessionalSummary =
    professionalSummary ||
    educationSummary ||
    extractedText ||
    "";

  const normalizedExperienceSummary =
    experienceSummary || "";

  const normalizedProjectsSummary =
    projectsSummary || "";

  const normalizedCertificationsSummary =
    certificationsSummary || "";

  const normalizedVolunteeringSummary =
    volunteeringSummary || "";

  const existingProfile =
    await pool.query(

      `SELECT *
       FROM profil_candidat
       WHERE id_candidat = $1`,

      [id_candidat]
    );

  if (
    existingProfile.rows.length > 0
  ) {

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

        normalizedProfessionalSummary,

        normalizedExperienceSummary,

        normalizedProjectsSummary,

        normalizedCertificationsSummary,

        normalizedVolunteeringSummary,

        normalizedSoftSkills,

        id_candidat
      ]
    );

    return result.rows[0];
  }

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

    VALUES ($1,$2,$3,$4,$5,$6,$7)

    RETURNING *`,

    [

      id_candidat,

      normalizedProfessionalSummary,

      normalizedExperienceSummary,

      normalizedProjectsSummary,

      normalizedCertificationsSummary,

      normalizedVolunteeringSummary,

      normalizedSoftSkills
    ]
  );

  return result.rows[0];
};

const getRecruiterByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT *
     FROM recrutori
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const getManagerByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT *
     FROM manageri
     WHERE id_utilizator = $1`,
    [userId]
  );

  return result.rows[0];
};

const cvHasApplicationInDepartment = async (cvId, departmentId) => {
  const result = await pool.query(
    `SELECT a.id_aplicatie
     FROM aplicatii a
     JOIN joburi j
       ON a.id_job = j.id_job
     WHERE a.id_cv = $1
       AND j.id_departament = $2
     LIMIT 1`,
    [cvId, departmentId]
  );

  return Boolean(result.rows[0]);
};

const getAllSkills = async () => {
  const result = await pool.query(
    `SELECT id_competenta, nume_competenta
     FROM competente
     ORDER BY nume_competenta`
  );

  return result.rows;
};

module.exports = {

  getCandidateByUserId,

  createCv,
  getCvsByCandidate,
  getCvById,
  deleteCv,
  cvHasApplications,

  updateExtractedText,

  getSkillByName,
  createSkill,
  addSkillToCv,

  createOrUpdateProfile,
  getRecruiterByUserId,
  getManagerByUserId,
  cvHasApplicationInDepartment,
  getAllSkills
};
