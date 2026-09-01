require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../src/config/db");
const authModel = require("../src/models/authModel");
const USER_ROLES = require("../src/constants/userRoles");

const seedAdmin = async () => {
  try {
    const {
      ADMIN_NUME,
      ADMIN_PRENUME,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    } = process.env;

    if (
      !ADMIN_NUME ||
      !ADMIN_PRENUME ||
      !ADMIN_EMAIL ||
      !ADMIN_PASSWORD
    ) {
      throw new Error(
        "Missing ADMIN_NUME, ADMIN_PRENUME, ADMIN_EMAIL or ADMIN_PASSWORD in .env"
      );
    }

    const existingAdmin = await authModel.findUserByEmail(ADMIN_EMAIL);

    if (existingAdmin) {
      console.log("Admin account already exists:", ADMIN_EMAIL);
      return;
    }

    const parola_hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await authModel.createUser({
      nume: ADMIN_NUME,
      prenume: ADMIN_PRENUME,
      email: ADMIN_EMAIL,
      parola_hash,
      rol: USER_ROLES.ADMIN
    });

    console.log("Admin account created:", admin.email);
  } catch (err) {
    console.error("Seed admin failed:", err.message);
  } finally {
    await pool.end();
  }
};

seedAdmin();
