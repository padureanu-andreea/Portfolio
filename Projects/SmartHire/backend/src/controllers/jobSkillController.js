const jobSkillModel = require("../models/jobSkillModel");
const USER_ROLES = require("../constants/userRoles");

const canRecruiterModifyJob = async (userId, job) => {
  const recruiter = await jobSkillModel.getRecruiterByUserId(userId);

  return Boolean(
    recruiter &&
    Number(job.id_recrutor) === Number(recruiter.id_recrutor) &&
    Number(job.id_departament) === Number(recruiter.id_departament)
  );
};

const addSkillToJob = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({
        message: "Doar recrutorii pot adauga competente la joburi"
      });
    }

    const jobId = req.params.id;
    const { nume_competenta, este_obligatoriu } = req.body;
    const skillName = String(nume_competenta || "").trim();

    if (!skillName) {
      return res.status(400).json({
        message: "Numele competentei este obligatoriu"
      });
    }

    if (skillName.length < 2 || skillName.length > 100) {
      return res.status(400).json({
        message: "Numele competentei trebuie sa aiba intre 2 si 100 de caractere"
      });
    }

    const job = await jobSkillModel.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canRecruiterModifyJob(req.user.id, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti modifica competentele acestui job"
      });
    }

    const skill = await jobSkillModel.findOrCreateSkillByName(skillName);
    const isMandatory =
      este_obligatoriu === true || este_obligatoriu === "true";

    const addedSkill = await jobSkillModel.addSkillToJob(jobId, {
      id_competenta: skill.id_competenta,
      este_obligatoriu: isMandatory,
      prioritate: isMandatory ? 5 : 3
    });

    res.status(201).json(addedSkill);
  } catch (err) {
    console.error("ADD JOB SKILL ERROR:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        message: "Competenta este deja asociata acestui job"
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
};

const getJobSkills = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await jobSkillModel.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const skills = await jobSkillModel.getJobSkills(jobId);

    res.json(skills);
  } catch (err) {
    console.error("GET JOB SKILLS ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const updateSkillForJob = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({
        message: "Doar recrutorii pot edita competentele joburilor"
      });
    }

    const jobId = req.params.id;
    const skillId = req.params.skillId;
    const isMandatory =
      req.body.este_obligatoriu === true ||
      req.body.este_obligatoriu === "true";

    const job = await jobSkillModel.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canRecruiterModifyJob(req.user.id, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti modifica competentele acestui job"
      });
    }

    const updatedSkill = await jobSkillModel.updateJobSkill(jobId, skillId, {
      este_obligatoriu: isMandatory,
      prioritate: isMandatory ? 5 : 3
    });

    if (!updatedSkill) {
      return res.status(404).json({
        message: "Competenta nu este asociata acestui job"
      });
    }

    res.json({
      message: "Competenta a fost actualizata",
      skill: updatedSkill
    });
  } catch (err) {
    console.error("UPDATE JOB SKILL ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const removeSkillFromJob = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({
        message: "Doar recrutorii pot sterge competente de la joburi"
      });
    }

    const jobId = req.params.id;
    const skillId = req.params.skillId;

    const job = await jobSkillModel.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canRecruiterModifyJob(req.user.id, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti modifica competentele acestui job"
      });
    }

    const removed = await jobSkillModel.removeSkillFromJob(jobId, skillId);

    if (!removed) {
      return res.status(404).json({
        message: "Competenta nu era asociata acestui job"
      });
    }

    res.json({
      message: "Competenta a fost eliminata de la job",
      skill: removed
    });
  } catch (err) {
    console.error("REMOVE JOB SKILL ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  addSkillToJob,
  getJobSkills,
  updateSkillForJob,
  removeSkillFromJob
};
