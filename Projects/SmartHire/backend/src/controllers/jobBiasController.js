const jobBiasModel = require("../models/jobBiasModel");
const openaiService = require("../services/openaiService");
const USER_ROLES = require("../constants/userRoles");

const canAccessJob = async (user, job) => {
  if (user.rol === USER_ROLES.ADMIN) {
    return true;
  }

  if (user.rol === USER_ROLES.RECRUTOR) {
    const recruiter = await jobBiasModel.getRecruiterByUserId(user.id);

    return Boolean(
      recruiter &&
      Number(recruiter.id_recrutor) === Number(job.id_recrutor) &&
      Number(recruiter.id_departament) === Number(job.id_departament)
    );
  }

  if (user.rol === USER_ROLES.MANAGER) {
    const manager = await jobBiasModel.getManagerByUserId(user.id);

    return Boolean(
      manager &&
      Number(manager.id_departament) === Number(job.id_departament)
    );
  }

  return false;
};

const analyzeJobBias = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({
        message: "Doar recrutorii pot analiza descrierea jobului"
      });
    }

    const jobId = req.params.id;
    const job = await jobBiasModel.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const recruiter = await jobBiasModel.getRecruiterByUserId(req.user.id);

    if (
      !recruiter ||
      Number(recruiter.id_recrutor) !== Number(job.id_recrutor) ||
      Number(recruiter.id_departament) !== Number(job.id_departament)
    ) {
      return res.status(403).json({
        message: "Nu poti analiza un job creat de alt recrutor"
      });
    }

    const existingAnalysis = await jobBiasModel.getBiasAnalysisByJobId(
      job.id_job
    );

    if (existingAnalysis && !existingAnalysis.analysis_needs_update) {
      return res.json({
        message: "Analiza de bias exista deja pentru descrierea curenta",
        analysis: existingAnalysis,
        aiResult: {
          has_bias: existingAnalysis.has_bias,
          bias_detectat: existingAnalysis.bias_detectat || "",
          sugestii_reformulare: existingAnalysis.sugestii_reformulare || "",
          reformulated_description: ""
        }
      });
    }

    const aiResult = await openaiService.analyzeJobBias({
      jobTitle: job.titlu_job,
      jobDescription: job.descriere_job
    });

    const savedAnalysis = await jobBiasModel.saveBiasAnalysis({
      id_job: job.id_job,
      has_bias: Boolean(aiResult.has_bias),
      bias_detectat: aiResult.has_bias
        ? aiResult.bias_detectat || "Au fost identificate formulari problematice."
        : existingAnalysis?.bias_detectat || "",
      sugestii_reformulare: aiResult.has_bias ? aiResult.sugestii_reformulare || "" : ""
    });

    res.json({
      message: "Analiza bias realizata cu succes",
      analysis: savedAnalysis,
      aiResult
    });
  } catch (err) {
    console.error("ANALYZE JOB BIAS ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const getJobBiasAnalysis = async (req, res) => {
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

    const job = await jobBiasModel.getJobById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti vedea analiza pentru acest job"
      });
    }

    const analysis = await jobBiasModel.getBiasAnalysisByJobId(req.params.id);

    if (!analysis) {
      return res.json(null);
    }

    res.json(analysis);
  } catch (err) {
    console.error("GET JOB BIAS ANALYSIS ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const applyAiRewrite = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.RECRUTOR) {
      return res.status(403).json({
        message: "Doar recrutorii pot aplica reformularea AI"
      });
    }

    const jobId = req.params.id;
    const job = await jobBiasModel.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const recruiter = await jobBiasModel.getRecruiterByUserId(req.user.id);

    if (
      !recruiter ||
      Number(recruiter.id_recrutor) !== Number(job.id_recrutor) ||
      Number(recruiter.id_departament) !== Number(job.id_departament)
    ) {
      return res.status(403).json({
        message: "Nu poti modifica un job creat de alt recrutor"
      });
    }

    const analysis = await jobBiasModel.getBiasAnalysisByJobId(jobId);
    const reformulatedDescription = req.body.reformulated_description;

    if (!analysis || !analysis.has_bias) {
      return res.status(400).json({
        message: "Nu exista o analiza cu bias care trebuie acceptata"
      });
    }

    if (!reformulatedDescription) {
      return res.status(400).json({
        message: "Nu exista o reformulare AI pentru acest job"
      });
    }

    const updatedJob = await jobBiasModel.updateJobDescription(
      jobId,
      reformulatedDescription
    );

    const updatedAnalysis = await jobBiasModel.markBiasAnalysisAccepted(jobId);

    res.json({
      message: "Descrierea jobului a fost actualizata cu reformularea AI",
      job: updatedJob,
      analysis: updatedAnalysis
    });
  } catch (err) {
    console.error("APPLY AI REWRITE ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  analyzeJobBias,
  getJobBiasAnalysis,
  applyAiRewrite
};
