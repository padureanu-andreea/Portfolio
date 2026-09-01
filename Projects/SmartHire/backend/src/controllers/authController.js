const bcrypt =
  require("bcrypt");

const jwt =
  require("jsonwebtoken");

const authModel =
  require("../models/authModel");

const USER_ROLES =
  require("../constants/userRoles");

const {
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidPhone
} = require("../utils/validation");

const register = async (
  req,
  res
) => {

  try {

    const {

      nume,
      prenume,
      email,
      telefon,
      parola
    } = req.body;

    const rol = USER_ROLES.CANDIDAT;
    const cleanNume = String(nume || "").trim();
    const cleanPrenume = String(prenume || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanTelefon = String(telefon || "").trim();

    if (
      !nume ||
      !prenume ||
      !email ||
      !telefon ||
      !parola
    ) {

      return res.status(400).json({
        message:
          "Toate campurile sunt obligatorii"
      });
    }

    if (!isValidName(cleanNume) || !isValidName(cleanPrenume)) {
      return res.status(400).json({
        message:
          "Numele si prenumele trebuie sa contina doar litere si sa aiba intre 2 si 80 de caractere"
      });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        message:
          "Emailul trebuie sa contina @ si sa se termine in .com"
      });
    }

    if (!isValidPhone(cleanTelefon)) {
      return res.status(400).json({
        message:
          "Numarul de telefon trebuie sa contina exact 10 cifre"
      });
    }

    if (!isValidPassword(parola)) {
      return res.status(400).json({
        message:
          "Parola trebuie sa aiba cel putin 4 caractere"
      });
    }

    const existingUser =
      await authModel.findUserByEmail(
        cleanEmail
      );

    if (existingUser) {

      return res.status(400).json({
        message:
          "Email deja utilizat"
      });
    }

    const parola_hash =
      await bcrypt.hash(
        parola,
        10
      );

    const user =
      await authModel.createUser({

        nume: cleanNume,
        prenume: cleanPrenume,
        email: cleanEmail,
        telefon: cleanTelefon,
        parola_hash,
        rol
      });

    res.status(201).json({

      message:
        "Utilizator creat cu succes",

      user: {

        id:
          user.id_utilizator,

        nume:
          user.nume,

        prenume:
          user.prenume,

        email:
          user.email,

        telefon:
          user.telefon,

        rol:
          user.rol
      }
    });

  } catch (err) {

    console.error(
      "REGISTER ERROR:",
      err
    );

    res.status(err.statusCode || 500).json({
      message: err.message
    });
  }
};

const login = async (
  req,
  res
) => {

  try {

    const {
      email,
      parola
    } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (
      !email ||
      !parola
    ) {

      return res.status(400).json({
        message:
          "Email si parola obligatorii"
      });
    }

    if (!isValidEmail(cleanEmail) || !isValidPassword(parola)) {
      return res.status(400).json({
        message:
          "Emailul sau parola nu au un format valid"
      });
    }

    const user =
      await authModel.findUserByEmail(
        cleanEmail
      );

    if (!user) {

      return res.status(401).json({
        message:
          "Credentiale invalide"
      });
    }

    const validPassword =
      await bcrypt.compare(
        parola,
        user.parola_hash
      );

    if (!validPassword) {

      return res.status(401).json({
        message:
          "Credentiale invalide"
      });
    }

    const token =
      jwt.sign(

        {

          id:
            user.id_utilizator,

          email:
            user.email,

          nume:
            user.nume,

          prenume:
            user.prenume,

          rol:
            user.rol
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d"
        }
      );

    res.json({

      message:
        "Autentificare reusita",

      token
    });

  } catch (err) {

    console.error(
      "LOGIN ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {

  register,
  login
};
