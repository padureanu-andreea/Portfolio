const departmentModel = require("../models/departmentModel");
const companyModel = require("../models/companyModel");
const notificationService = require("../services/notificationService");
const USER_ROLES = require("../constants/userRoles");

const getAllDepartments = async (req, res) => {
  try {
    const departments = await departmentModel.getAllDepartments();
    res.json(departments);
  } catch (err) {
    console.error("GET DEPARTMENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await departmentModel.getDepartmentById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: "Departamentul nu exista" });
    }

    res.json(department);
  } catch (err) {
    console.error("GET DEPARTMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate crea departamente"
      });
    }

    const { nume_departament } = req.body;

    if (!nume_departament) {
      return res.status(400).json({
        message: "nume_departament este obligatoriu"
      });
    }

    const company = await companyModel.getCompany();

    if (!company) {
      return res.status(400).json({
        message: "Compania trebuie configurata inainte de a crea departamente"
      });
    }

    const department = await departmentModel.createDepartment({
      id_companie: company.id_companie,
      nume_departament
    });

    await notificationService.createNotification({
      id_utilizator: req.user.id,
      titlu: "Istoric administrare",
      mesaj: `A fost creat departamentul "${nume_departament}".`
    });

    res.status(201).json(department);
  } catch (err) {
    console.error("CREATE DEPARTMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate edita departamente"
      });
    }

    const existingDepartment = await departmentModel.getDepartmentById(
      req.params.id
    );

    if (!existingDepartment) {
      return res.status(404).json({
        message: "Departamentul nu exista"
      });
    }

    const { nume_departament } = req.body;

    if (!nume_departament) {
      return res.status(400).json({
        message: "nume_departament este obligatoriu"
      });
    }

    const updatedDepartment = await departmentModel.updateDepartment(
      req.params.id,
      { nume_departament }
    );

    await notificationService.createNotification({
      id_utilizator: req.user.id,
      titlu: "Istoric administrare",
      mesaj: `Departamentul "${existingDepartment.nume_departament}" a fost redenumit in "${nume_departament}".`
    });

    res.json(updatedDepartment);
  } catch (err) {
    console.error("UPDATE DEPARTMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate sterge departamente"
      });
    }

    const existingDepartment = await departmentModel.getDepartmentById(
      req.params.id
    );

    if (!existingDepartment) {
      return res.status(404).json({ message: "Departamentul nu exista" });
    }

    const deletedDepartment = await departmentModel.deleteDepartment(
      req.params.id
    );

    await notificationService.createNotification({
      id_utilizator: req.user.id,
      titlu: "Istoric administrare",
      mesaj: `A fost sters departamentul "${deletedDepartment.nume_departament}".`
    });

    res.json({
      message: "Departament sters cu succes",
      department: deletedDepartment
    });
  } catch (err) {
    console.error("DELETE DEPARTMENT ERROR:", err);

    if (err.code === "23503") {
      return res.status(400).json({
        message: "Departamentul nu poate fi sters deoarece este folosit de joburi sau manageri"
      });
    }

    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
