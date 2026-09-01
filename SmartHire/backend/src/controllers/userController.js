const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");
const userModel = require("../models/userModel");
const notificationService = require("../services/notificationService");
const USER_ROLES = require("../constants/userRoles");
const {
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidPhone
} = require("../utils/validation");

const createStaffUser = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate crea conturi interne"
      });
    }

    const {
      nume,
      prenume,
      email,
      telefon,
      parola,
      rol,
      id_departament
    } = req.body;
    const cleanNume = String(nume || "").trim();
    const cleanPrenume = String(prenume || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanTelefon = String(telefon || "").trim();

    if (
      !nume ||
      !prenume ||
      !email ||
      !telefon ||
      !parola ||
      !rol
    ) {
      return res.status(400).json({
        message: "Toate campurile sunt obligatorii"
      });
    }

    if (!isValidName(cleanNume) || !isValidName(cleanPrenume)) {
      return res.status(400).json({
        message: "Numele si prenumele trebuie sa contina doar litere si sa aiba intre 2 si 80 de caractere"
      });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        message: "Emailul trebuie sa contina @ si sa se termine in .com"
      });
    }

    if (!isValidPhone(cleanTelefon)) {
      return res.status(400).json({
        message: "Numarul de telefon trebuie sa contina exact 10 cifre"
      });
    }

    if (!isValidPassword(parola)) {
      return res.status(400).json({
        message: "Parola trebuie sa aiba cel putin 4 caractere"
      });
    }

    const allowedRoles = [
      USER_ROLES.RECRUTOR,
      USER_ROLES.MANAGER
    ];

    if (!allowedRoles.includes(rol)) {
      return res.status(400).json({
        message: "Adminul poate crea doar conturi RECRUTOR sau MANAGER"
      });
    }

    if ((rol === USER_ROLES.MANAGER || rol === USER_ROLES.RECRUTOR) && !id_departament) {
      return res.status(400).json({
        message: "id_departament este obligatoriu pentru RECRUTOR si MANAGER"
      });
    }

    const existingUser = await authModel.findUserByEmail(cleanEmail);

    if (existingUser) {
      return res.status(400).json({
        message: "Email deja utilizat"
      });
    }

    const parola_hash = await bcrypt.hash(parola, 10);

    const user = await authModel.createUser({
      nume: cleanNume,
      prenume: cleanPrenume,
      email: cleanEmail,
      telefon: cleanTelefon,
      parola_hash,
      rol,
      id_departament
    });

    await notificationService.createNotification({
      id_utilizator: req.user.id,
      titlu: "Istoric administrare",
      mesaj: `A fost creat contul ${rol} pentru ${cleanPrenume} ${cleanNume}.`
    });

    res.status(201).json({
      message: "Cont intern creat cu succes",
      user: {
        id: user.id_utilizator,
        nume: user.nume,
        prenume: user.prenume,
        email: user.email,
        telefon: user.telefon,
        rol: user.rol
      }
    });
  } catch (err) {
    console.error("CREATE STAFF USER ERROR:", err);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate vedea utilizatorii"
      });
    }

    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate vedea detaliile utilizatorilor"
      });
    }

    const user = await userModel.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilizatorul nu exista"
      });
    }

    res.json(user);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await userModel.getProfileById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilizatorul nu exista"
      });
    }

    res.json(user);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { nume, prenume, telefon } = req.body;
    const cleanNume = String(nume || "").trim();
    const cleanPrenume = String(prenume || "").trim();
    const cleanTelefon = String(telefon || "").trim();

    if (!nume || !prenume || !telefon) {
      return res.status(400).json({
        message: "Numele, prenumele si telefonul sunt obligatorii"
      });
    }

    if (!isValidName(cleanNume) || !isValidName(cleanPrenume)) {
      return res.status(400).json({
        message: "Numele si prenumele trebuie sa contina doar litere si sa aiba intre 2 si 80 de caractere"
      });
    }

    if (!isValidPhone(cleanTelefon)) {
      return res.status(400).json({
        message: "Numarul de telefon trebuie sa contina exact 10 cifre"
      });
    }

    const updatedUser = await userModel.updateProfile(req.user.id, {
      nume: cleanNume,
      prenume: cleanPrenume,
      telefon: cleanTelefon
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "Utilizatorul nu exista"
      });
    }

    res.json({
      message: "Profil actualizat cu succes",
      user: updatedUser,
      token: jwt.sign(
        {
          id: updatedUser.id_utilizator,
          email: updatedUser.email,
          nume: updatedUser.nume,
          prenume: updatedUser.prenume,
          rol: updatedUser.rol
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      )
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const changeMyPassword = async (req, res) => {
  try {
    const { parola_curenta, parola_noua } = req.body;

    if (!parola_curenta || !parola_noua) {
      return res.status(400).json({
        message: "Parola curenta si parola noua sunt obligatorii"
      });
    }

    if (!isValidPassword(parola_noua)) {
      return res.status(400).json({
        message: "Parola noua trebuie sa aiba cel putin 4 caractere"
      });
    }

    const userPassword = await userModel.getPasswordHashById(req.user.id);

    if (!userPassword) {
      return res.status(404).json({
        message: "Utilizatorul nu exista"
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      parola_curenta,
      userPassword.parola_hash
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Parola curenta nu este corecta"
      });
    }

    const newPasswordHash = await bcrypt.hash(parola_noua, 10);

    await userModel.updatePassword(req.user.id, newPasswordHash);

    res.json({
      message: "Parola a fost actualizata cu succes"
    });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate edita utilizatori"
      });
    }

    if (Number(req.params.id) === Number(req.user.id)) {
      return res.status(400).json({
        message: "Adminul nu isi poate modifica propriul cont aici"
      });
    }

    const {
      nume,
      prenume,
      email,
      telefon,
      parola,
      rol,
      id_departament
    } = req.body;
    const cleanNume = String(nume || "").trim();
    const cleanPrenume = String(prenume || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanTelefon = String(telefon || "").trim();

    if (
      !nume ||
      !prenume ||
      !email ||
      !telefon ||
      !rol
    ) {
      return res.status(400).json({
        message: "Nume, prenume, email, telefon si rol sunt obligatorii"
      });
    }

    if (!isValidName(cleanNume) || !isValidName(cleanPrenume)) {
      return res.status(400).json({
        message: "Numele si prenumele trebuie sa contina doar litere si sa aiba intre 2 si 80 de caractere"
      });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        message: "Emailul trebuie sa contina @ si sa se termine in .com"
      });
    }

    if (!isValidPhone(cleanTelefon)) {
      return res.status(400).json({
        message: "Numarul de telefon trebuie sa contina exact 10 cifre"
      });
    }

    if (parola && !isValidPassword(parola)) {
      return res.status(400).json({
        message: "Parola trebuie sa aiba cel putin 4 caractere"
      });
    }

    const allowedRoles = [
      USER_ROLES.RECRUTOR,
      USER_ROLES.MANAGER,
      USER_ROLES.CANDIDAT
    ];

    if (!allowedRoles.includes(rol)) {
      return res.status(400).json({
        message: "Rol invalid pentru editarea utilizatorului"
      });
    }

    if (
      (rol === USER_ROLES.RECRUTOR || rol === USER_ROLES.MANAGER) &&
      !id_departament
    ) {
      return res.status(400).json({
        message: "id_departament este obligatoriu pentru RECRUTOR si MANAGER"
      });
    }

    const existingUser = await userModel.getUserById(req.params.id);

    if (!existingUser) {
      return res.status(404).json({
        message: "Utilizatorul nu exista"
      });
    }

    if (existingUser.rol === USER_ROLES.CANDIDAT && rol !== USER_ROLES.CANDIDAT) {
      return res.status(400).json({
        message: "Conturile de candidat pot fi actualizate doar ca date de baza"
      });
    }

    if (existingUser.rol !== USER_ROLES.CANDIDAT && rol === USER_ROLES.CANDIDAT) {
      return res.status(400).json({
        message: "Conturile interne nu pot fi transformate in conturi de candidat"
      });
    }

    if (
      existingUser.rol !== USER_ROLES.RECRUTOR &&
      existingUser.rol !== USER_ROLES.MANAGER &&
      existingUser.rol !== USER_ROLES.CANDIDAT
    ) {
      return res.status(400).json({
        message: "Acest tip de cont nu poate fi editat aici"
      });
    }

    const existingEmail = await userModel.findUserByEmailExceptId(
      cleanEmail,
      req.params.id
    );

    if (existingEmail) {
      return res.status(400).json({
        message: "Email deja utilizat"
      });
    }

    if (rol === USER_ROLES.RECRUTOR || rol === USER_ROLES.MANAGER) {
      const department = await userModel.getDepartmentById(id_departament);

      if (!department) {
        return res.status(404).json({
          message: "Departamentul nu exista"
        });
      }
    }

    const parola_hash = parola
      ? await bcrypt.hash(parola, 10)
      : null;

    const updatedUser = await userModel.updateUser(req.params.id, {
      nume: cleanNume,
      prenume: cleanPrenume,
      email: cleanEmail,
      telefon: cleanTelefon,
      parola_hash,
      rol,
      id_departament
    });

    await notificationService.createNotification({
      id_utilizator: req.user.id,
      titlu: "Istoric administrare",
      mesaj: `A fost actualizat contul ${rol} pentru ${cleanPrenume} ${cleanNume}.`
    });

    res.json({
      message: "Utilizator actualizat cu succes",
      user: updatedUser
    });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        message: "Exista deja un recrutor pentru acest departament"
      });
    }

    if (err.code === "23503") {
      return res.status(400).json({
        message: "Utilizatorul are date asociate care nu permit schimbarea rolului"
      });
    }

    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Doar adminul poate sterge utilizatori"
      });
    }

    if (Number(req.params.id) === Number(req.user.id)) {
      return res.status(400).json({
        message: "Adminul nu isi poate sterge propriul cont"
      });
    }

    const existingUser = await userModel.getUserById(req.params.id);

    if (!existingUser) {
      return res.status(404).json({
        message: "Utilizatorul nu exista"
      });
    }

    const deletedUser = await userModel.deleteUser(req.params.id);

    await notificationService.createNotification({
      id_utilizator: req.user.id,
      titlu: "Istoric administrare",
      mesaj: `A fost sters contul ${deletedUser.rol} pentru ${deletedUser.prenume} ${deletedUser.nume}.`
    });

    res.json({
      message: "Utilizator sters cu succes",
      user: deletedUser
    });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);

    if (err.code === "23503") {
      return res.status(400).json({
        message: "Utilizatorul nu poate fi sters deoarece are date asociate in aplicatie"
      });
    }

    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createStaffUser,
  getUsers,
  getUserById,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  updateUser,
  deleteUser
};
