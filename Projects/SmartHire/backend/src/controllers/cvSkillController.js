const cvSkillModel =
  require("../models/cvSkillModel");

const USER_ROLES =
  require("../constants/userRoles");

const canViewCvSkills = async (user, cv) => {
  if (user.rol === USER_ROLES.ADMIN) {
    return true;
  }

  if (user.rol === USER_ROLES.CANDIDAT) {
    const candidate =
      await cvSkillModel.getCandidateByUserId(
        user.id
      );

    return Boolean(
      candidate &&
      Number(cv.id_candidat) === Number(candidate.id_candidat)
    );
  }

  if (user.rol === USER_ROLES.RECRUTOR) {
    const recruiter =
      await cvSkillModel.getRecruiterByUserId(
        user.id
      );

    if (!recruiter || !recruiter.id_departament) {
      return false;
    }

    return cvSkillModel.cvHasApplicationInDepartment(
      cv.id_cv,
      recruiter.id_departament
    );
  }

  if (user.rol === USER_ROLES.MANAGER) {
    const manager =
      await cvSkillModel.getManagerByUserId(
        user.id
      );

    if (!manager || !manager.id_departament) {
      return false;
    }

    return cvSkillModel.cvHasApplicationInDepartment(
      cv.id_cv,
      manager.id_departament
    );
  }

  return false;
};

const addSkillToCv = async (req, res) => {

  try {

    if (req.user.rol !== USER_ROLES.CANDIDAT) {

      return res.status(403).json({
        message:
          "Doar candidatii pot adauga competente la CV"
      });
    }

    const cvId = req.params.id;

    const {
      id_competenta,
      ani_experienta,
      nivel_competenta,
      confidence_score
    } = req.body;

    if (!id_competenta) {

      return res.status(400).json({
        message: "id_competenta este obligatoriu"
      });
    }

    const candidate =
      await cvSkillModel.getCandidateByUserId(
        req.user.id
      );

    const cv =
      await cvSkillModel.getCvById(cvId);

    if (!cv) {

      return res.status(404).json({
        message: "CV-ul nu exista"
      });
    }

    if (cv.id_candidat !== candidate.id_candidat) {

      return res.status(403).json({
        message:
          "Nu poti modifica acest CV"
      });
    }

    const skill =
      await cvSkillModel.getSkillById(
        id_competenta
      );

    if (!skill) {

      return res.status(404).json({
        message: "Competenta nu exista"
      });
    }

    if (
      nivel_competenta &&
      (
        nivel_competenta < 1 ||
        nivel_competenta > 5
      )
    ) {

      return res.status(400).json({
        message:
          "Nivelul competentei trebuie sa fie intre 1 si 5"
      });
    }

    const addedSkill =
      await cvSkillModel.addSkillToCv(
        cvId,
        {
          id_competenta,

          ani_experienta:
            ani_experienta ?? 0,

          nivel_competenta:
            nivel_competenta ?? 3,

          confidence_score:
            confidence_score ?? null
        }
      );

    res.status(201).json(addedSkill);

  } catch (err) {

    console.error(
      "ADD CV SKILL ERROR:",
      err
    );

    if (err.code === "23505") {

      return res.status(400).json({
        message:
          "Competenta este deja asociata acestui CV"
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
};

const getCvSkills = async (req, res) => {

  try {

    const cvId = req.params.id;

    const cv =
      await cvSkillModel.getCvById(cvId);

    if (!cv) {

      return res.status(404).json({
        message: "CV-ul nu exista"
      });
    }

    const hasAccess =
      await canViewCvSkills(
        req.user,
        cv
      );

    if (!hasAccess) {

      return res.status(403).json({
        message:
          "Nu poti vedea competentele acestui CV"
      });
    }

    const skills =
      await cvSkillModel.getCvSkills(cvId);

    res.json(skills);

  } catch (err) {

    console.error(
      "GET CV SKILLS ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const removeSkillFromCv = async (req, res) => {

  try {

    if (req.user.rol !== USER_ROLES.CANDIDAT) {

      return res.status(403).json({
        message:
          "Doar candidatii pot sterge competente din CV"
      });
    }

    const cvId = req.params.id;

    const skillId =
      req.params.skillId;

    const candidate =
      await cvSkillModel.getCandidateByUserId(
        req.user.id
      );

    const cv =
      await cvSkillModel.getCvById(cvId);

    if (!cv) {

      return res.status(404).json({
        message: "CV-ul nu exista"
      });
    }

    if (cv.id_candidat !== candidate.id_candidat) {

      return res.status(403).json({
        message:
          "Nu poti modifica acest CV"
      });
    }

    const removedSkill =
      await cvSkillModel.removeSkillFromCv(
        cvId,
        skillId
      );

    if (!removedSkill) {

      return res.status(404).json({
        message:
          "Competenta nu era asociata CV-ului"
      });
    }

    res.json({
      message:
        "Competenta eliminata din CV",
      skill: removedSkill
    });

  } catch (err) {

    console.error(
      "REMOVE CV SKILL ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  addSkillToCv,
  getCvSkills,
  removeSkillFromCv
};