const scoringModel = require("../models/scoringModel");
const scoringService = require("../services/scoringService");
const aiPythonService = require("../services/aiPythonService");

const USER_ROLES = require("../constants/userRoles");
const APPLICATION_STATUS = require("../constants/applicationStatus");

const canAccessApplication = async (user, application) => {
  if (user.rol === USER_ROLES.ADMIN) {
    return true;
  }

  if (user.rol === USER_ROLES.RECRUTOR) {
    const recruiter = await scoringModel.getRecruiterByUserId(user.id);

    return Boolean(
      recruiter &&
      Number(application.id_recrutor) === Number(recruiter.id_recrutor) &&
      Number(application.id_departament) === Number(recruiter.id_departament)
    );
  }

  if (user.rol === USER_ROLES.MANAGER) {
    const manager = await scoringModel.getManagerByUserId(user.id);

    return Boolean(
      manager &&
      Number(application.id_departament) === Number(manager.id_departament)
    );
  }

  return false;
};

const canAccessJob = async (user, job) => {
  if (user.rol === USER_ROLES.ADMIN) {
    return true;
  }

  if (user.rol === USER_ROLES.RECRUTOR) {
    const recruiter = await scoringModel.getRecruiterByUserId(user.id);

    return Boolean(
      recruiter &&
      Number(job.id_recrutor) === Number(recruiter.id_recrutor) &&
      Number(job.id_departament) === Number(recruiter.id_departament)
    );
  }

  if (user.rol === USER_ROLES.MANAGER) {
    const manager = await scoringModel.getManagerByUserId(user.id);

    return Boolean(
      manager &&
      Number(job.id_departament) === Number(manager.id_departament)
    );
  }

  return false;
};

const buildAhpWeights = (config) => ({
  technical_skills: config.hard_skills_weight,
  soft_skills: config.soft_skills_weight,
  experience: config.experience_weight,
  projects: config.projects_weight,
  education: config.education_weight,
  certifications: config.volunteering_weight
});

const formatJobSkillsForAi = (jobSkills) =>
  jobSkills.map((skill) => ({
    id: skill.id_competenta,
    name: skill.nume_competenta,
    required: Boolean(skill.este_obligatoriu),
    priority: skill.prioritate || 3
  }));

const formatCvSkillsForAi = (cvSkills) =>
  cvSkills.map((skill) => ({
    id: skill.id_competenta,
    name: skill.nume_competenta,
    years_experience: skill.ani_experienta || 0,
    level: skill.nivel_competenta || 3,
    confidence: skill.confidence_score || 0.7
  }));

const applyAdvancedAiScores = ({ scores, aiAnalysis, classicExplanation }) => {
  const semanticScores = aiAnalysis.semantic_scores || {};
  const missingSkills = aiAnalysis.missing_skills || {};

  const finalScore =
    aiAnalysis.final_score ??
    aiAnalysis.ml_score ??
    semanticScores.overall ??
    scores.finalScore;

  const updatedScores = {
    ...scores,
    finalScore,
    hardSkillsScore:
      semanticScores.technical_skills ?? scores.hardSkillsScore,
    softSkillsScore:
      semanticScores.soft_skills ?? scores.softSkillsScore,
    experienceScore:
      semanticScores.experience ?? scores.experienceScore,
    projectsScore:
      semanticScores.projects ?? scores.projectsScore,
    educationScore:
      semanticScores.education ?? scores.educationScore,
    volunteeringScore:
      semanticScores.cv_completeness ?? scores.volunteeringScore,
    missingSkills: JSON.stringify({
      obligatorii: missingSkills.required || [],
      optionale: missingSkills.optional || []
    })
  };

  updatedScores.explanation = JSON.stringify({
    algorithm:
      "NLP embeddings + ML-ready scoring + AHP explainability",
    classicExplanation,
    aiAnalysis,
    finalHybridScore: updatedScores.finalScore,
    hybridFormula:
      "Scorul final este calculat de analiza NLP/ML-ready, iar AHP explica importanta criteriilor."
  });

  return updatedScores;
};

const getScoringConfigForJob = async (jobId) => {
  let config = await scoringModel.getScoringConfig(jobId);

  if (!config) {
    const defaultWeights = scoringService.generateDefaultConfig();

    config = {
      hard_skills_weight: defaultWeights.hard_skills_weight,
      soft_skills_weight: defaultWeights.soft_skills_weight,
      experience_weight: defaultWeights.experience_weight,
      projects_weight: defaultWeights.projects_weight,
      education_weight: defaultWeights.education_weight,
      volunteering_weight: defaultWeights.volunteering_weight
    };
  }

  return config;
};

const calculateScoresForApplication = async (application) => {
  const jobSkills = await scoringModel.getJobSkills(application.id_job);
  const cvSkills = await scoringModel.getCvSkills(application.id_cv);

  if (jobSkills.length === 0) {
    throw new Error(
      "Jobul nu are competente asociate. Adauga competente la job inainte de calcularea scorului."
    );
  }

  const profile = await scoringModel.getCandidateProfile(
    application.id_candidat
  );

  const config = await getScoringConfigForJob(application.id_job);

  const scores = scoringService.calculateCompatibilityScore({
    jobSkills,
    cvSkills,
    profile,
    config
  });

  if (application.descriere_job && application.text_extras_raw) {
    const jobTextForAnalysis = [
      application.titlu_job,
      application.descriere_job
    ]
      .filter(Boolean)
      .join("\n\n");

    const aiAnalysis = await aiPythonService.scoreCvForJob({
      jobDescription: jobTextForAnalysis,
      cvText: application.text_extras_raw,
      jobSkills: formatJobSkillsForAi(jobSkills),
      cvSkills: formatCvSkillsForAi(cvSkills),
      ahpWeights: buildAhpWeights(config)
    });

    const updatedScores = applyAdvancedAiScores({
      scores,
      aiAnalysis,
      classicExplanation: JSON.parse(scores.explanation)
    });

    Object.assign(scores, updatedScores);
  }

  return scoringModel.updateApplicationScore(
    application.id_aplicatie,
    scores
  );
};

const calculateApplicationScore = async (req, res) => {
  try {
    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {
      return res.status(403).json({
        message: "Doar adminii, recrutorii sau managerii pot calcula scorul"
      });
    }

    const applicationId = req.params.id;

    const application = await scoringModel.getApplicationContext(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Aplicatia nu exista"
      });
    }

    const hasAccess = await canAccessApplication(req.user, application);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti calcula scorul pentru aceasta aplicatie"
      });
    }

    if (application.status === APPLICATION_STATUS.RETRASA) {
      return res.status(400).json({
        message:
          "Candidatura a fost retrasa si nu mai poate fi luata in considerare la scoring"
      });
    }

    const updatedApplication = await calculateScoresForApplication(application);

    res.json({
      message: "Scor calculat cu succes",
      application: updatedApplication
    });
  } catch (err) {
    console.error("CALCULATE SCORE ERROR:", err);
    res.status(500).json({
      message: err.message
    });
  }
};

const calculateMissingScoresForJob = async (req, res) => {
  try {
    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {
      return res.status(403).json({
        message: "Doar adminii, recrutorii sau managerii pot calcula scoruri"
      });
    }

    const job = await scoringModel.getJobById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti calcula scoruri pentru acest job"
      });
    }

    const jobSkills = await scoringModel.getJobSkills(job.id_job);

    if (jobSkills.length === 0) {
      return res.status(400).json({
        message:
          "Jobul nu are competente asociate. Adauga competente la job inainte de calcularea scorurilor."
      });
    }

    const applications = await scoringModel.getUnscoredApplicationsByJob(
      job.id_job
    );

    if (applications.length === 0) {
      return res.json({
        message: "Nu exista candidaturi active fara scor pentru acest job",
        calculated: [],
        failed: []
      });
    }

    const calculated = [];
    const failed = [];

    for (const application of applications) {
      try {
        const updatedApplication = await calculateScoresForApplication(
          application
        );

        calculated.push(updatedApplication);
      } catch (err) {
        failed.push({
          id_aplicatie: application.id_aplicatie,
          message: err.message
        });
      }
    }

    res.json({
      message: `Au fost calculate ${calculated.length} scoruri.`,
      calculated,
      failed
    });
  } catch (err) {
    console.error("CALCULATE JOB SCORES ERROR:", err);
    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  calculateApplicationScore,
  calculateMissingScoresForJob
};
