const rankingModel = require("../models/rankingModel");
const USER_ROLES = require("../constants/userRoles");

const canAccessJob = async (user, job) => {
  if (user.rol === USER_ROLES.ADMIN) {
    return true;
  }

  if (user.rol === USER_ROLES.RECRUTOR) {
    const recruiter = await rankingModel.getRecruiterByUserId(user.id);

    return Boolean(
      recruiter &&
      Number(job.id_recrutor) === Number(recruiter.id_recrutor) &&
      Number(job.id_departament) === Number(recruiter.id_departament)
    );
  }

  if (user.rol === USER_ROLES.MANAGER) {
    const manager = await rankingModel.getManagerByUserId(user.id);

    return Boolean(
      manager &&
      Number(job.id_departament) === Number(manager.id_departament)
    );
  }

  return false;
};

const getJobRanking = async (req, res) => {
  try {
    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {
      return res.status(403).json({
        message: "Doar adminii,recrutorii sau managerii pot vedea rankingul"
      });
    }

    const jobId = req.params.id;

    const job = await rankingModel.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti vedea rankingul pentru acest job"
      });
    }

    const ranking = await rankingModel.getJobRanking(jobId);

    res.json({
      job: {
        id_job: job.id_job,
        titlu_job: job.titlu_job
      },
      total_candidati: ranking.length,
      ranking
    });
  } catch (err) {
    console.error("GET JOB RANKING ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const getApplicationAnalysis = async (req, res) => {
  try {
    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {
      return res.status(403).json({
        message: "Doar adminii,recrutorii sau managerii pot vedea analiza"
      });
    }

    const applicationId = req.params.id;

    const analysis = await rankingModel.getApplicationAnalysis(applicationId);

    if (!analysis) {
      return res.status(404).json({
        message: "Aplicatia nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, analysis);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti vedea analiza pentru aceasta aplicatie"
      });
    }

    let parsedExplanation = null;

    if (analysis.rezumat_ai) {
      try {
        parsedExplanation = JSON.parse(analysis.rezumat_ai);
      } catch {
        parsedExplanation = analysis.rezumat_ai;
      }
    }

    res.json({
      application: {
        id_aplicatie: analysis.id_aplicatie,
        status: analysis.status,
        data_aplicare: analysis.data_aplicare
      },

      candidate: {
        id_candidat: analysis.id_candidat,
        nume: analysis.nume,
        prenume: analysis.prenume,
        email: analysis.email
      },

      job: {
        id_job: analysis.id_job,
        titlu_job: analysis.titlu_job
      },

      cv: {
        id_cv: analysis.id_cv,
        nume_fisier: analysis.nume_fisier
      },

      scores: {
        scor_compatibilitate: analysis.scor_compatibilitate,
        hard_skills_score: analysis.hard_skills_score,
        soft_skills_score: analysis.soft_skills_score,
        experience_score: analysis.experience_score,
        projects_score: analysis.projects_score,
        education_score: analysis.education_score,
        volunteering_score: analysis.volunteering_score
      },

      competente_lipsa: analysis.competente_lipsa,

      explanation: parsedExplanation
    });
  } catch (err) {
    console.error("GET APPLICATION ANALYSIS ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  getJobRanking,
  getApplicationAnalysis
};