const skillModel = require("../models/skillModel");
const USER_ROLES = require("../constants/userRoles");

const getAllSkills = async (req, res) => {
  try {
    const skills = await skillModel.getAllSkills();
    res.json(skills);
  } catch (err) {
    console.error("GET SKILLS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const createSkill = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminii pot adauga competente globale"
      });
    }

    const { nume_competenta } = req.body;

    if (!nume_competenta) {
      return res.status(400).json({
        message: "nume_competenta este obligatoriu"
      });
    }

    const skill = await skillModel.createSkill(nume_competenta);
    res.status(201).json(skill);
  } catch (err) {
    console.error("CREATE SKILL ERROR:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        message: "Competenta exista deja"
      });
    }

    res.status(500).json({ message: err.message });
  }
};

const updateSkill = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminii pot edita competente globale"
      });
    }

    const { nume_competenta } = req.body;

    if (!nume_competenta) {
      return res.status(400).json({
        message: "nume_competenta este obligatoriu"
      });
    }

    const existingSkill = await skillModel.getSkillById(req.params.id);

    if (!existingSkill) {
      return res.status(404).json({
        message: "Competenta nu exista"
      });
    }

    const updatedSkill = await skillModel.updateSkill(
      req.params.id,
      nume_competenta
    );

    res.json(updatedSkill);
  } catch (err) {
    console.error("UPDATE SKILL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteSkill = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate sterge competente"
      });
    }

    const existingSkill = await skillModel.getSkillById(req.params.id);

    if (!existingSkill) {
      return res.status(404).json({
        message: "Competenta nu exista"
      });
    }

    const deletedSkill = await skillModel.deleteSkill(req.params.id);

    res.json({
      message: "Competenta stearsa cu succes",
      skill: deletedSkill
    });
  } catch (err) {
    console.error("DELETE SKILL ERROR:", err);

    if (err.code === "23503") {
      return res.status(400).json({
        message: "Competenta nu poate fi stearsa deoarece este folosita in joburi sau CV-uri"
      });
    }

    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill
};
