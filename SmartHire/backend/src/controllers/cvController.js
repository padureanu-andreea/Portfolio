const path = require("path");
const fs = require("fs");

const aiPythonService =
  require("../services/aiPythonService");

const cvModel =
  require("../models/cvModel");

const cvParsingService =
  require("../services/cvParsingService");

const USER_ROLES =
  require("../constants/userRoles");

const uploadCv = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.CANDIDAT) {

      return res.status(403).json({
        message:
          "Doar candidatii pot incarca CV-uri"});}

    if (!req.file) {
      return res.status(400).json({
        message: "Fisier lipsa"});}

    const candidate = await cvModel.getCandidateByUserId(req.user.id);

    if (!candidate) {
      return res.status(400).json({
        message: "Nu exista candidat asociat userului"});}

    const parsedCv = await cvParsingService.parseCv(req.file.path);
    const knownSkills = await cvModel.getAllSkills();
    const aiCvAnalysis = await aiPythonService.analyzeCv({
        cvText: parsedCv.extractedText,
        knownSkills: knownSkills.map((skill) => skill.nume_competenta)});
    const cv = await cvModel.createCv({id_candidat: candidate.id_candidat,
        nume_fisier: req.file.originalname,
        cale_fisier: req.file.path});

    await cvModel.updateExtractedText(cv.id_cv, parsedCv.extractedText);
    const detectedTechnicalSkills = aiCvAnalysis.technical_skills || [];

    for (const detectedSkill of detectedTechnicalSkills) {
      const yearsExperience = Math.max(0, Math.round(Number(detectedSkill.years_experience || 0)));
      const skillLevel = Math.min(5, Math.max(1, Math.round(Number(detectedSkill.level || 3))));
      const skill = knownSkills.find((item) =>
            item.nume_competenta.toLowerCase() === String(detectedSkill.name || "").toLowerCase());

      if (skill) {
        await cvModel.addSkillToCv({id_cv: cv.id_cv, id_competenta: skill.id_competenta,
          ani_experienta: yearsExperience, nivel_competenta: skillLevel,
          confidence_score: detectedSkill.confidence || 0.7});}}

    await cvModel.createOrUpdateProfile({id_candidat: candidate.id_candidat,
      professionalSummary: aiCvAnalysis.professional_summary,
      experienceSummary: aiCvAnalysis.experience_summary,
      projectsSummary: aiCvAnalysis.projects_summary,
      educationSummary: aiCvAnalysis.education_summary,
      certificationsSummary: aiCvAnalysis.certifications_summary,
      volunteeringSummary: aiCvAnalysis.volunteering_summary,
      softSkills: aiCvAnalysis.soft_skills || [],
      extractedText: parsedCv.extractedText});

    const updatedCv = await cvModel.getCvById(cv.id_cv);
    res.status(201).json({message: "CV incarcat si procesat cu succes", cv: updatedCv,
      parsing: {detectedSkills: detectedTechnicalSkills,
        detectedSoftSkills: aiCvAnalysis.soft_skills || [],
        hasVolunteering: Boolean(aiCvAnalysis.volunteering_summary),
        hasProjects: Boolean(aiCvAnalysis.projects_summary)}});
  } catch (err) {
    console.error("UPLOAD CV ERROR:", err);

    res.status(500).json({message: err.message});
  }
};

const getMyCvs = async (
  req,
  res
) => {

  try {

    if (
      req.user.rol !== USER_ROLES.CANDIDAT
    ) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const candidate =
      await cvModel.getCandidateByUserId(
        req.user.id
      );

    const cvs =
      await cvModel.getCvsByCandidate(
        candidate.id_candidat
      );

    res.json(cvs);

  } catch (err) {

    console.error(
      "GET CVS ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const downloadCv = async (
  req,
  res
) => {

  try {

    const cv =
      await cvModel.getCvById(
        req.params.id
      );

    if (!cv) {

      return res.status(404).json({
        message:
          "CV-ul nu exista"
      });
    }

    if (req.user.rol === USER_ROLES.CANDIDAT) {

      const candidate =
        await cvModel.getCandidateByUserId(
          req.user.id
        );

      if (
        !candidate ||
        cv.id_candidat !== candidate.id_candidat
      ) {

        return res.status(403).json({
          message:
            "Nu poti descarca acest CV"
        });
      }
    }

    if (req.user.rol === USER_ROLES.RECRUTOR) {

      const recruiter =
        await cvModel.getRecruiterByUserId(
          req.user.id
        );

      if (!recruiter || !recruiter.id_departament) {

        return res.status(403).json({
          message:
            "Nu exista recrutor sau departament asociat"
        });
      }

      const hasAccess =
        await cvModel.cvHasApplicationInDepartment(
          cv.id_cv,
          recruiter.id_departament
        );

      if (!hasAccess) {

        return res.status(403).json({
          message:
            "Nu poti descarca CV-uri din alt departament"
        });
      }
    }

    if (req.user.rol === USER_ROLES.MANAGER) {

      const manager =
        await cvModel.getManagerByUserId(
          req.user.id
        );

      if (!manager || !manager.id_departament) {

        return res.status(403).json({
          message:
            "Nu exista manager sau departament asociat"
        });
      }

      const hasAccess =
        await cvModel.cvHasApplicationInDepartment(
          cv.id_cv,
          manager.id_departament
        );

      if (!hasAccess) {

        return res.status(403).json({
          message:
            "Nu poti descarca CV-uri din alt departament"
        });
      }
    }

    const filePath =
      path.resolve(cv.cale_fisier);

    res.download(filePath, cv.nume_fisier);

  } catch (err) {

    console.error(
      "DOWNLOAD CV ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const deleteCv = async (
  req,
  res
) => {

  try {

    if (
      req.user.rol !== USER_ROLES.CANDIDAT
    ) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const candidate =
      await cvModel.getCandidateByUserId(
        req.user.id
      );

    const cv =
      await cvModel.getCvById(
        req.params.id
      );

    if (!cv) {

      return res.status(404).json({
        message:
          "CV-ul nu exista"
      });
    }

    if (
      cv.id_candidat !==
      candidate.id_candidat
    ) {

      return res.status(403).json({
        message:
          "Nu poti sterge acest CV"
      });
    }

    const cvIsUsedInApplication =
      await cvModel.cvHasApplications(
        cv.id_cv
      );

    if (cvIsUsedInApplication) {

      return res.status(400).json({
        message:
          "Nu poti sterge acest CV deoarece este folosit intr-o candidatura"
      });
    }

    if (
      fs.existsSync(cv.cale_fisier)
    ) {

      fs.unlinkSync(
        cv.cale_fisier
      );
    }

    const deleted =
      await cvModel.deleteCv(
        req.params.id
      );

    res.json({

      message:
        "CV sters cu succes",

      cv: deleted
    });

  } catch (err) {

    console.error(
      "DELETE CV ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {

  uploadCv,
  getMyCvs,
  downloadCv,
  deleteCv
};
