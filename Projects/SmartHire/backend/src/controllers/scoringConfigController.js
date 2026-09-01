const scoringConfigModel = require("../models/scoringConfigModel");
const ahpService = require("../services/ahpService");

const USER_ROLES = require("../constants/userRoles");
const JOB_PROFILES = require("../constants/jobProfiles");

const canAccessJob = async (user, job) => {
  if (user.rol === USER_ROLES.ADMIN) {
    return true;
  }

  if (user.rol === USER_ROLES.RECRUTOR) {
    const recruiter = await scoringConfigModel.getRecruiterByUserId(user.id);

    return Boolean(
      recruiter &&
      Number(recruiter.id_recrutor) === Number(job.id_recrutor) &&
      Number(recruiter.id_departament) === Number(job.id_departament)
    );
  }

  if (user.rol === USER_ROLES.MANAGER) {
    const manager = await scoringConfigModel.getManagerByUserId(user.id);

    return Boolean(
      manager &&
      Number(manager.id_departament) === Number(job.id_departament)
    );
  }

  return false;
};

const validateWeights = (weights) => {
  const total =
    Number(weights.hard_skills_weight) +
    Number(weights.soft_skills_weight) +
    Number(weights.experience_weight) +
    Number(weights.projects_weight) +
    Number(weights.education_weight) +
    Number(weights.volunteering_weight);

  return Math.abs(total - 100) < 0.01;
};

const generateScoringConfig = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({
        message: "Doar recrutorii pot configura scoringul"
      });
    }

    const jobId = req.params.id;
    const { profil_job } = req.body;

    const allowedProfiles = Object.values(JOB_PROFILES);

    const profile = profil_job || JOB_PROFILES.GENERAL;

    if (!allowedProfiles.includes(profile)) {
      return res.status(400).json({
        message: "Profil job invalid"
      });
    }

    const job = await scoringConfigModel.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const recruiter = await scoringConfigModel.getRecruiterByUserId(req.user.id);

    if (
      !recruiter ||
      Number(recruiter.id_recrutor) !== Number(job.id_recrutor) ||
      Number(recruiter.id_departament) !== Number(job.id_departament)
    ) {
      return res.status(403).json({
        message: "Nu poti configura scoringul pentru acest job"
      });
    }

    const existingConfig = await scoringConfigModel.getConfigByJobId(jobId);

    if (existingConfig) {
      return res.status(400).json({
        message: "Configul exista deja pentru acest job"
      });
    }

    const weights = ahpService.generateWeightsForProfile(profile);

    const config = await scoringConfigModel.createConfig(
      jobId,
      profile,
      weights
    );

    res.status(201).json(config);
  } catch (err) {
    console.error("GENERATE SCORING CONFIG ERROR:", err);
    res.status(500).json({
      message: err.message
    });
  }
};

const getScoringConfig = async (req, res) => {
  try {
    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {
      return res.status(403).json({
        message: "Acces interzis"
      });
    }

    const job = await scoringConfigModel.getJobById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti vedea configuratia de scoring pentru acest job"
      });
    }

    const config = await scoringConfigModel.getConfigByJobId(req.params.id);

    if (!config) {
      return res.status(404).json({
        message: "Configul de scoring nu exista"
      });
    }

    res.json(config);
  } catch (err) {
    console.error("GET SCORING CONFIG ERROR:", err);
    res.status(500).json({
      message: err.message
    });
  }
};

const updateScoringConfig = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({
        message: "Doar recrutorii pot modifica scoringul"
      });
    }

    if (!validateWeights(req.body)) {
      return res.status(400).json({
        message: "Ponderile trebuie sa insumeze 100"
      });
    }

    const jobId = req.params.id;

    const job = await scoringConfigModel.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const recruiter = await scoringConfigModel.getRecruiterByUserId(req.user.id);

    if (
      !recruiter ||
      Number(recruiter.id_recrutor) !== Number(job.id_recrutor) ||
      Number(recruiter.id_departament) !== Number(job.id_departament)
    ) {
      return res.status(403).json({
        message: "Nu poti modifica scoringul pentru acest job"
      });
    }

    const existingConfig = await scoringConfigModel.getConfigByJobId(jobId);

    if (!existingConfig) {
      return res.status(404).json({
        message: "Configul de scoring nu exista"
      });
    }

    const updatedConfig = await scoringConfigModel.updateConfig(
      jobId,
      req.body
    );

    res.json(updatedConfig);
  } catch (err) {
    console.error("UPDATE SCORING CONFIG ERROR:", err);
    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  generateScoringConfig,
  getScoringConfig,
  updateScoringConfig
};
