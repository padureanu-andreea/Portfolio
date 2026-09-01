// src/services/scoringService.js

const ahpService = require("./ahpService");

const JOB_PROFILES =
  require("../constants/jobProfiles");

const normalize = (value, max = 100) => {

  if (!value || value < 0) {
    return 0;
  }

  if (value > max) {
    return max;
  }

  return Number(value.toFixed(2));
};

const calculateHardSkillsScore = (
  jobSkills,
  cvSkills
) => {

  if (!jobSkills.length) {

    return {
      score: 0,
      missingRequiredSkills: [],
      missingOptionalSkills: []
    };
  }

  let totalWeight = 0;
  let matchedWeight = 0;

  const missingRequiredSkills = [];
  const missingOptionalSkills = [];

  jobSkills.forEach((jobSkill) => {

    const priority =
      jobSkill.prioritate || 3;

    const mandatoryBonus =
      jobSkill.este_obligatoriu ? 2 : 1;

    const weight =
      priority * mandatoryBonus;

    totalWeight += weight;

    const matchedSkill =
      cvSkills.find(
        (cvSkill) =>
          cvSkill.id_competenta ===
          jobSkill.id_competenta
      );

    if (matchedSkill) {

      const levelFactor =
        (matchedSkill.nivel_competenta || 3) / 5;

      const confidenceFactor =
        matchedSkill.confidence_score || 1;

      matchedWeight +=
        weight *
        levelFactor *
        confidenceFactor;

    } else if (jobSkill.este_obligatoriu) {
      missingRequiredSkills.push(jobSkill.nume_competenta);
    } else {
      missingOptionalSkills.push(jobSkill.nume_competenta);
    }
  });

  return {

    score:
      normalize(
        (matchedWeight / totalWeight) * 100
      ),

    missingRequiredSkills,
    missingOptionalSkills
  };
};

const calculateExperienceScore = (
  jobSkills,
  cvSkills
) => {

  if (!jobSkills.length) {
    return 0;
  }

  let total = 0;
  let count = 0;

  jobSkills.forEach((jobSkill) => {

    const matchedSkill =
      cvSkills.find(
        (cvSkill) =>
          cvSkill.id_competenta ===
          jobSkill.id_competenta
      );

    if (matchedSkill) {

      const years =
        matchedSkill.ani_experienta || 0;

      let score = 0;

      if (years >= 5) {
        score = 100;
      }
      else if (years >= 3) {
        score = 80;
      }
      else if (years >= 1) {
        score = 60;
      }
      else {
        score = 30;
      }

      total += score;
      count++;
    }
  });

  if (count === 0) {
    return 0;
  }

  return normalize(total / count);
};

const calculateProjectsScore = (
  profile
) => {

  if (
    !profile ||
    !profile.proiecte_text
  ) {
    return 0;
  }

  const text =
    profile.proiecte_text.toLowerCase();

  let score = 40;

  const indicators = [

    "aplicatie",
    "platforma",
    "backend",
    "frontend",
    "api",
    "database",
    "react",
    "node",
    "python",
    "github",
    "echipa",
    "proiect"

  ];

  indicators.forEach((indicator) => {

    if (
      text.includes(indicator)
    ) {
      score += 6;
    }
  });

  return normalize(score);
};

const calculateSoftSkillsScore = (
  profile
) => {

  if (!profile) {
    return 0;
  }

  const text = `

    ${profile.soft_skills_detectate || ""}
    ${profile.voluntariat_text || ""}
    ${profile.experienta_text || ""}

  `.toLowerCase();

  if (!text.trim()) {
    return 0;
  }

  let score = 30;

  const indicators = [

    "leadership",
    "comunicare",
    "communication",
    "teamwork",
    "echipa",
    "coordonare",
    "voluntariat",
    "adaptabilitate",
    "organizare",
    "responsabilitate"

  ];

  indicators.forEach((indicator) => {

    if (
      text.includes(indicator)
    ) {
      score += 7;
    }
  });

  return normalize(score);
};

const calculateEducationScore = (
  profile
) => {

  if (!profile) {
    return 0;
  }

  const text = `

    ${profile.certificari_text || ""}
    ${profile.rezumat_profesional || ""}

  `.toLowerCase();

  if (!text.trim()) {
    return 0;
  }

  let score = 30;

  const indicators = [

    "certificare",
    "certification",
    "curs",
    "course",
    "facultate",
    "licenta",
    "master",
    "aws",
    "cisco",
    "sql",
    "python"

  ];

  indicators.forEach((indicator) => {

    if (
      text.includes(indicator)
    ) {
      score += 7;
    }
  });

  return normalize(score);
};

const calculateVolunteeringScore = (
  profile
) => {

  if (
    !profile ||
    !profile.voluntariat_text
  ) {
    return 0;
  }

  const text =
    profile.voluntariat_text.toLowerCase();

  let score = 30;

  const indicators = [

    "voluntariat",
    "volunteer",
    "organizare",
    "coordonare",
    "leadership",
    "echipa",
    "eveniment",
    "mentorat",
    "community",
    "fundraising"

  ];

  indicators.forEach((indicator) => {

    if (
      text.includes(indicator)
    ) {
      score += 7;
    }
  });

  return normalize(score);
};

const calculateFinalScore = (
  partialScores,
  config
) => {

  const finalScore =

    partialScores.hardSkillsScore *
      (config.hard_skills_weight / 100) +

    partialScores.softSkillsScore *
      (config.soft_skills_weight / 100) +

    partialScores.experienceScore *
      (config.experience_weight / 100) +

    partialScores.projectsScore *
      (config.projects_weight / 100) +

    partialScores.educationScore *
      (config.education_weight / 100) +

    partialScores.volunteeringScore *
      (config.volunteering_weight / 100);

  return normalize(finalScore);
};

const calculateCompatibilityScore = ({
  jobSkills,
  cvSkills,
  profile,
  config
}) => {

  const hardSkillsResult =
    calculateHardSkillsScore(
      jobSkills,
      cvSkills
    );

  const partialScores = {

    hardSkillsScore:
      hardSkillsResult.score,

    softSkillsScore:
      calculateSoftSkillsScore(profile),

    experienceScore:
      calculateExperienceScore(
        jobSkills,
        cvSkills
      ),

    projectsScore:
      calculateProjectsScore(profile),

    educationScore:
      calculateEducationScore(profile),

    volunteeringScore:
      calculateVolunteeringScore(profile)
  };

  const finalScore =
    calculateFinalScore(
      partialScores,
      config
    );

  const explanation =
    JSON.stringify({

      message:
        "Scor calculat pe baza criteriilor SmartHire",

      partialScores: {

        ...partialScores,

        volunteeringScore:
          partialScores.volunteeringScore
      },

      weights: {

        hard_skills_weight:
          config.hard_skills_weight,

        soft_skills_weight:
          config.soft_skills_weight,

        experience_weight:
          config.experience_weight,

        projects_weight:
          config.projects_weight,

        education_weight:
          config.education_weight,

        volunteering_weight:
          config.volunteering_weight
      },

      missingMandatorySkills:
        hardSkillsResult.missingRequiredSkills,

      missingOptionalSkills:
        hardSkillsResult.missingOptionalSkills
    });

  const missingSkills = JSON.stringify({
    obligatorii: hardSkillsResult.missingRequiredSkills,
    optionale: hardSkillsResult.missingOptionalSkills
  });

  return {

    finalScore,

    ...partialScores,

    missingSkills,

    explanation
  };
};

const generateDefaultConfig = () => {

  return ahpService.generateWeightsForProfile(
    JOB_PROFILES.GENERAL
  );
};

module.exports = {

  calculateCompatibilityScore,
  generateDefaultConfig
};
