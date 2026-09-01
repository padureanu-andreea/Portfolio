const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const skillController = require("../controllers/skillController");

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: Endpointuri pentru gestionarea competentelor utilizate in aplicatia SmartHire
 */

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Listeaza toate competentele
 *     description: Returneaza lista tuturor competentelor existente in sistem. Aceste competente pot fi asociate joburilor si CV-urilor.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista competentelor a fost returnata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_competenta:
 *                     type: integer
 *                     example: 1
 *                   nume_competenta:
 *                     type: string
 *                     example: JavaScript
 *       401:
 *         description: Token lipsa sau invalid
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/skills",
  authMiddleware,
  skillController.getAllSkills
);

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Creeaza o competenta noua
 *     description: Adauga o competenta noua in sistem. Competenta poate fi folosita ulterior pentru asocierea cu joburi sau CV-uri.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nume_competenta
 *             properties:
 *               nume_competenta:
 *                 type: string
 *                 example: React
 *     responses:
 *       201:
 *         description: Competenta a fost creata cu succes
 *       400:
 *         description: Date invalide sau camp obligatoriu lipsa
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a crea competente
 *       409:
 *         description: Exista deja o competenta cu acest nume
 *       500:
 *         description: Eroare interna de server
 */
router.post(
  "/skills",
  authMiddleware,
  skillController.createSkill
);

/**
 * @swagger
 * /api/skills/{id}:
 *   put:
 *     summary: Actualizeaza o competenta
 *     description: Modifica denumirea unei competente existente, pe baza ID-ului primit ca parametru.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul competentei care va fi actualizata
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nume_competenta
 *             properties:
 *               nume_competenta:
 *                 type: string
 *                 example: Node.js
 *     responses:
 *       200:
 *         description: Competenta a fost actualizata cu succes
 *       400:
 *         description: Date invalide sau camp obligatoriu lipsa
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica competente
 *       404:
 *         description: Competenta nu a fost gasita
 *       409:
 *         description: Exista deja o competenta cu acest nume
 *       500:
 *         description: Eroare interna de server
 */
router.put(
  "/skills/:id",
  authMiddleware,
  skillController.updateSkill
);

/**
 * @swagger
 * /api/skills/{id}:
 *   delete:
 *     summary: Sterge o competenta
 *     description: Sterge o competenta existenta din sistem. Operatiunea poate fi restrictionata daca aceasta competenta este deja asociata unor joburi sau CV-uri.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul competentei care va fi stearsa
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Competenta a fost stearsa cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a sterge competente
 *       404:
 *         description: Competenta nu a fost gasita
 *       409:
 *         description: Competenta nu poate fi stearsa deoarece este asociata cu joburi sau CV-uri
 *       500:
 *         description: Eroare interna de server
 */
router.delete(
  "/skills/:id",
  authMiddleware,
  skillController.deleteSkill
);

module.exports = router;