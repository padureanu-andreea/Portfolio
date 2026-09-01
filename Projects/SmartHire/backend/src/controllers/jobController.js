const jobModel = require("../models/jobModel");
const USER_ROLES = require("../constants/userRoles");
const JOB_STATUS = require("../constants/jobStatus");
const {
  isValidLocationName,
  isValidLongText,
  isValidSalaryRange,
  isValidShortText
} = require("../utils/validation");

const WORK_MODES = ["REMOTE", "HIBRID", "FIZIC"];

const validateWorkMode = (mod_lucru) => {
  return !mod_lucru || WORK_MODES.includes(mod_lucru);
};

const getJobs = async (req, res) => {
  try {
    let jobs;

    if (!req.user || req.user.rol === USER_ROLES.CANDIDAT) {
      jobs = await jobModel.getJobsForCandidate();
    } else if (req.user.rol === USER_ROLES.RECRUTOR) {
      jobs = await jobModel.getJobsForRecruiter(req.user.id);
    } else if (req.user.rol === USER_ROLES.MANAGER) {
      jobs = await jobModel.getJobsForManager(req.user.id);
    } else if (req.user.rol === USER_ROLES.ADMIN) {
      jobs = await jobModel.getAllJobs();
    } else {
      return res.status(403).json({
        message: "Rol invalid"
      });
    }

    res.json(jobs);
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({
      message: "Eroare la preluarea joburilor"
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await jobModel.getJobById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    if (
      req.user.rol === USER_ROLES.CANDIDAT &&
      job.status !== JOB_STATUS.ACTIV
    ) {
      return res.status(403).json({
        message: "Nu poti vedea acest job"
      });
    }

    if (req.user.rol === USER_ROLES.RECRUTOR) {
      const recruiter = await jobModel.getRecruiterByUserId(req.user.id);

      if (
        !recruiter ||
        recruiter.id_departament !== job.id_departament
      ) {
        return res.status(403).json({
          message: "Nu poti vedea joburi din alt departament"
        });
      }
    }

    if (req.user.rol === USER_ROLES.MANAGER) {
      const manager = await jobModel.getManagerByUserId(req.user.id);

      if (
        !manager ||
        manager.id_departament !== job.id_departament
      ) {
        return res.status(403).json({
          message: "Nu poti vedea joburi din alt departament"
        });
      }
    }

    res.json(job);
  } catch (err) {
    console.error("GET JOB ERROR:", err);
    res.status(500).json({
      message: "Eroare la preluarea jobului"
    });
  }
};

const createJob = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({ message: "Doar recrutorii pot crea joburi" });
    }

    const recruiter = await jobModel.getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(400).json({ message: "Nu exista recruiter asociat acestui user" });
    }

    const jobData = {
      ...req.body,
      id_departament: recruiter.id_departament,
      id_recrutor: recruiter.id_recrutor
    };

    if (!jobData.tara || !jobData.oras || !jobData.mod_lucru) {
      return res.status(400).json({
        message: "Tara, orasul si modul de lucru sunt obligatorii"
      });
    }

    if (!isValidShortText(jobData.titlu_job, 255)) {
      return res.status(400).json({
        message: "Titlul jobului trebuie sa aiba intre 2 si 255 de caractere"
      });
    }

    if (!isValidLongText(jobData.descriere_job, 12000)) {
      return res.status(400).json({
        message: "Descrierea jobului trebuie sa aiba cel putin 10 caractere"
      });
    }

    if (!isValidLocationName(jobData.tara, 100)) {
      return res.status(400).json({
        message: "Tara trebuie sa contina doar litere si sa aiba intre 2 si 100 de caractere"
      });
    }

    if (!isValidLocationName(jobData.oras, 100)) {
      return res.status(400).json({
        message: "Orasul trebuie sa contina doar litere si sa aiba intre 2 si 100 de caractere"
      });
    }

    if (!isValidSalaryRange(jobData.salariu_minim, jobData.salariu_maxim)) {
      return res.status(400).json({
        message: "Salariile trebuie sa fie numere pozitive, iar salariul maxim nu poate fi mai mic decat salariul minim"
      });
    }

    if (!validateWorkMode(jobData.mod_lucru)) {
      return res.status(400).json({
        message: "Modul de lucru este invalid"
      });
    }

    const job = await jobModel.createJob(jobData);

    res.status(201).json(job);
  } catch (err) {
    console.error("CREATE JOB ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const updateJob = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({ message: "Doar recrutorii pot edita joburi" });
    }

    const existingJob = await jobModel.getJobById(req.params.id);

    if (!existingJob) {
      return res.status(404).json({ message: "Jobul nu exista" });
    }

    const recruiter = await jobModel.getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(400).json({ message: "Nu exista recruiter asociat acestui user" });
    }

    if (existingJob.id_recrutor !== recruiter.id_recrutor) {
      return res.status(403).json({ message: "Nu poti edita un job creat de alt recruiter" });
    }

    if (Number(req.body.id_departament) !== Number(recruiter.id_departament)) {
      return res.status(403).json({
        message: "Nu poti muta jobul in alt departament"
      });
    }

    if (!isValidShortText(req.body.titlu_job, 255)) {
      return res.status(400).json({
        message: "Titlul jobului trebuie sa aiba intre 2 si 255 de caractere"
      });
    }

    if (!isValidLongText(req.body.descriere_job, 12000)) {
      return res.status(400).json({
        message: "Descrierea jobului trebuie sa aiba cel putin 10 caractere"
      });
    }

    if (!isValidLocationName(req.body.tara, 100)) {
      return res.status(400).json({
        message: "Tara trebuie sa contina doar litere si sa aiba intre 2 si 100 de caractere"
      });
    }

    if (!isValidLocationName(req.body.oras, 100)) {
      return res.status(400).json({
        message: "Orasul trebuie sa contina doar litere si sa aiba intre 2 si 100 de caractere"
      });
    }

    if (!isValidSalaryRange(req.body.salariu_minim, req.body.salariu_maxim)) {
      return res.status(400).json({
        message: "Salariile trebuie sa fie numere pozitive, iar salariul maxim nu poate fi mai mic decat salariul minim"
      });
    }

    const descriptionChanged =
      req.body.descriere_job !== undefined &&
      req.body.descriere_job.trim() !== (existingJob.descriere_job || "").trim();

    if (!validateWorkMode(req.body.mod_lucru)) {
      return res.status(400).json({
        message: "Modul de lucru este invalid"
      });
    }

    const updateData = {
      ...req.body,
      status: descriptionChanged ? JOB_STATUS.DRAFT : req.body.status
    };

    const updatedJob = await jobModel.updateJob(req.params.id, updateData);

    if (descriptionChanged) {
      await jobModel.markBiasAnalysisNeedsUpdate(req.params.id);
    }

    res.json(updatedJob);
  } catch (err) {
    console.error("UPDATE JOB ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({ message: "Doar recrutorii pot sterge joburi" });
    }

    const existingJob = await jobModel.getJobById(req.params.id);

    if (!existingJob) {
      return res.status(404).json({ message: "Jobul nu exista" });
    }

    const recruiter = await jobModel.getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(400).json({ message: "Nu exista recruiter asociat acestui user" });
    }

    if (
      Number(existingJob.id_recrutor) !== Number(recruiter.id_recrutor) ||
      Number(existingJob.id_departament) !== Number(recruiter.id_departament)
    ) {
      return res.status(403).json({ message: "Nu poti sterge un job creat de alt recruiter" });
    }

    const deletedJob = await jobModel.deleteJob(req.params.id);

    res.json({
      message: "Job sters cu succes",
      job: deletedJob
    });
  } catch (err) {
    console.error("DELETE JOB ERROR:", err);

    if (err.code === "23503") {
      return res.status(409).json({
        message: "Jobul nu poate fi sters deoarece are date asociate"
      });
    }

    res.status(500).json({ message: err.message });
  }
};

const publishJob = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({
        message: "Doar recrutorii pot publica joburi"
      });
    }

    const existingJob = await jobModel.getJobById(req.params.id);

    if (!existingJob) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const recruiter = await jobModel.getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(400).json({
        message: "Nu exista recrutor asociat acestui user"
      });
    }

    if (existingJob.id_recrutor !== recruiter.id_recrutor) {
      return res.status(403).json({
        message: "Nu poti publica un job creat de alt recrutor"
      });
    }

    const jobSkillsCount =
      await jobModel.getJobSkillsCount(req.params.id);

    if (jobSkillsCount === 0) {
      return res.status(400).json({
        message:
          "Adauga cel putin o competenta la job inainte de publicare"
      });
    }

    const biasAnalysis = await jobModel.getBiasAnalysisByJobId(req.params.id);

    if (!biasAnalysis) {
      return res.status(400).json({
        message: "Jobul trebuie analizat AI pentru bias inainte de publicare"
      });
    }

    if (biasAnalysis.analysis_needs_update) {
      return res.status(400).json({
        message: "Jobul trebuie analizat din nou dupa modificarea descrierii"
      });
    }

    if (biasAnalysis.has_bias) {
      return res.status(400).json({
        message: "Jobul nu poate fi publicat pana cand analiza AI nu trece fara bias"
      });
    }

    const updatedJob = await jobModel.updateJobStatus(
      req.params.id,
      JOB_STATUS.ACTIV
    );

    res.json({
      message: "Job publicat cu succes",
      job: updatedJob
    });
  } catch (err) {
    console.error("PUBLISH JOB ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const closeJob = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({
        message: "Doar recrutorii pot inchide joburi"
      });
    }

    const existingJob = await jobModel.getJobById(req.params.id);

    if (!existingJob) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const recruiter = await jobModel.getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(400).json({
        message: "Nu exista recrutor asociat acestui user"
      });
    }

    if (existingJob.id_recrutor !== recruiter.id_recrutor) {
      return res.status(403).json({
        message: "Nu poti inchide un job creat de alt recrutor"
      });
    }

    const updatedJob = await jobModel.updateJobStatus(
      req.params.id,
      JOB_STATUS.INCHIS
    );

    res.json({
      message: "Job inchis cu succes",
      job: updatedJob
    });
  } catch (err) {
    console.error("CLOSE JOB ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  closeJob
};
