const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpointuri pentru autentificare si inregistrare utilizatori
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inregistrare utilizator nou
 *     description: Creeaza un cont nou pentru un utilizator SmartHire. Parola este criptata, iar rolul trebuie sa fie unul valid.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nume
 *               - prenume
 *               - email
 *               - parola
 *             properties:
 *               nume:
 *                 type: string
 *                 example: Popescu
 *               prenume:
 *                 type: string
 *                 example: Andrei
 *               email:
 *                 type: string
 *                 format: email
 *                 example: andrei.popescu@email.com
 *               parola:
 *                 type: string
 *                 format: password
 *                 example: parola123
 *     responses:
 *       201:
 *         description: Utilizator inregistrat cu succes
 *       400:
 *         description: Date invalide sau campuri lipsa
 *       409:
 *         description: Exista deja un utilizator cu acest email
 *       500:
 *         description: Eroare interna de server
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentificare utilizator
 *     description: Autentifica un utilizator pe baza emailului si parolei si returneaza un token JWT.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - parola
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: andrei.popescu@email.com
 *               parola:
 *                 type: string
 *                 format: password
 *                 example: parola123
 *     responses:
 *       200:
 *         description: Autentificare realizata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Autentificare reusita
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_utilizator:
 *                       type: integer
 *                       example: 1
 *                     nume:
 *                       type: string
 *                       example: Popescu
 *                     prenume:
 *                       type: string
 *                       example: Andrei
 *                     email:
 *                       type: string
 *                       example: andrei.popescu@email.com
 *                     rol:
 *                       type: string
 *                       example: CANDIDAT
 *       400:
 *         description: Email sau parola lipsa
 *       401:
 *         description: Email sau parola incorecta
 *       500:
 *         description: Eroare interna de server
 */
router.post("/login", authController.login);

module.exports = router;