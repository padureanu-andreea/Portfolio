const statisticsModel = require("../models/statisticsModel");
const USER_ROLES = require("../constants/userRoles");

const getRecruitmentStatistics = async (req, res) => {
  try {
    if (
      req.user.rol !== USER_ROLES.ADMIN &&
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER
    ) {
      return res.status(403).json({
        message: "Nu ai acces la statistici."
      });
    }

    let scope = {
      type: req.user.rol
    };

    if (req.user.rol === USER_ROLES.RECRUTOR) {
      const recruiter = await statisticsModel.getRecruiterByUserId(req.user.id);

      if (!recruiter) {
        return res.status(404).json({
          message: "Profilul de recrutor nu a fost gasit."
        });
      }

      scope = {
        type: USER_ROLES.RECRUTOR,
        id_recrutor: recruiter.id_recrutor,
        id_departament: recruiter.id_departament
      };
    }

    if (req.user.rol === USER_ROLES.MANAGER) {
      const manager = await statisticsModel.getManagerByUserId(req.user.id);

      if (!manager) {
        return res.status(404).json({
          message: "Profilul de manager nu a fost gasit."
        });
      }

      scope = {
        type: USER_ROLES.MANAGER,
        id_departament: manager.id_departament
      };
    }

    const statistics = await statisticsModel.getRecruitmentStatistics(scope);

    return res.json(statistics);
  } catch (err) {
    console.error("GET RECRUITMENT STATISTICS ERROR:", err);
    return res.status(500).json({
      message: "Nu s-au putut incarca statisticile."
    });
  }
};

module.exports = {
  getRecruitmentStatistics
};
