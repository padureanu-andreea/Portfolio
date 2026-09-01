const companyModel = require("../models/companyModel");
const notificationService = require("../services/notificationService");
const USER_ROLES = require("../constants/userRoles");

const getCompany = async (req, res) => {
  try {
    const company = await companyModel.getCompany();

    if (!company) {
      return res.status(404).json({
        message: "Compania nu exista"
      });
    }

    res.json(company);
  } catch (err) {
    console.error("GET COMPANY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const createCompany = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate crea compania"
      });
    }

    const existingCompany = await companyModel.getCompany();

    if (existingCompany) {
      return res.status(409).json({
        message: "Compania este deja configurata"
      });
    }

    const { nume_companie, cod_fiscal, oras, tara } = req.body;

    if (!nume_companie) {
      return res.status(400).json({
        message: "nume_companie este obligatoriu"
      });
    }

    const company = await companyModel.createCompany({
      nume_companie,
      cod_fiscal,
      oras,
      tara
    });

    await notificationService.createNotification({
      id_utilizator: req.user.id,
      titlu: "Istoric administrare",
      mesaj: `A fost configurata compania "${nume_companie}".`
    });

    res.status(201).json(company);
  } catch (err) {
    console.error("CREATE COMPANY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate edita compania"
      });
    }

    const { nume_companie, cod_fiscal, oras, tara } = req.body;

    if (!nume_companie) {
      return res.status(400).json({
        message: "nume_companie este obligatoriu"
      });
    }

    const company = await companyModel.updateCompany({
      nume_companie,
      cod_fiscal,
      oras,
      tara
    });

    if (!company) {
      return res.status(404).json({
        message: "Compania nu exista"
      });
    }

    await notificationService.createNotification({
      id_utilizator: req.user.id,
      titlu: "Istoric administrare",
      mesaj: `Datele companiei "${nume_companie}" au fost actualizate.`
    });

    res.json(company);
  } catch (err) {
    console.error("UPDATE COMPANY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCompany,
  createCompany,
  updateCompany
};
