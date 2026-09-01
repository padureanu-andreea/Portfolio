const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const scoringConfigController = require("../controllers/scoringConfigController");

/**
 * @swagger
 * tags:
 *   name: Scoring Config
 *   description: Endpointuri pentru generarea si gestionarea configuratiei de scoring asociate joburilor
 */

/**
 * @swagger
 * /api/jobs/{id}/scoring-config:
 *   post:
 *     summary: Genereaza configuratia de scoring pentru un job
 *     description: Genereaza automat configuratia de scoring pentru un job, pe baza profilului jobului si a criteriilor AHP. Configuratia poate include ponderi pentru hard skills, soft skills, experienta, proiecte, educatie si voluntariat.
 *     tags: [Scoring Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului pentru care se genereaza configuratia de scoring
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job_profile:
 *                 type: string
 *                 enum: [TECHNICAL, MANAGEMENT, INTERNSHIP, GENERAL]
 *                 example: TECHNICAL
 *     responses:
 *       201:
 *         description: Configuratia de scoring a fost generata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_config:
 *                   type: integer
 *                   example: 1
 *                 id_job:
 *                   type: integer
 *                   example: 1
 *                 job_profile:
 *                   type: string
 *                   example: TECHNICAL
 *                 hard_skills_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.35
 *                 soft_skills_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.15
 *                 experience_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.20
 *                 projects_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.15
 *                 education_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.10
 *                 volunteering_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.05
 *       400:
 *         description: Date invalide sau configuratia nu poate fi generata
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a genera configuratia pentru acest job
 *       404:
 *         description: Jobul nu a fost gasit
 *       409:
 *         description: Configuratia de scoring exista deja pentru acest job
 *       500:
 *         description: Eroare interna de server
 */
router.post(
  "/jobs/:id/scoring-config",
  authMiddleware,
  scoringConfigController.generateScoringConfig
);

/**
 * @swagger
 * /api/jobs/{id}/scoring-config:
 *   get:
 *     summary: Returneaza configuratia de scoring a unui job
 *     description: Returneaza configuratia de scoring asociata unui job, inclusiv profilul jobului si ponderile criteriilor folosite in calculul scorului de compatibilitate.
 *     tags: [Scoring Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului pentru care se cauta configuratia de scoring
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Configuratia de scoring a fost returnata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_config:
 *                   type: integer
 *                   example: 1
 *                 id_job:
 *                   type: integer
 *                   example: 1
 *                 job_profile:
 *                   type: string
 *                   example: TECHNICAL
 *                 hard_skills_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.35
 *                 soft_skills_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.15
 *                 experience_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.20
 *                 projects_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.15
 *                 education_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.10
 *                 volunteering_weight:
 *                   type: number
 *                   format: float
 *                   example: 0.05
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a vedea configuratia acestui job
 *       404:
 *         description: Jobul sau configuratia de scoring nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/jobs/:id/scoring-config",
  authMiddleware,
  scoringConfigController.getScoringConfig
);

/**
 * @swagger
 * /api/jobs/{id}/scoring-config:
 *   put:
 *     summary: Actualizeaza configuratia de scoring a unui job
 *     description: Permite modificarea ponderilor folosite in scoringul candidatului pentru un anumit job. Suma ponderilor ar trebui sa fie coerenta cu logica de scoring implementata in backend.
 *     tags: [Scoring Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului pentru care se actualizeaza configuratia de scoring
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job_profile:
 *                 type: string
 *                 enum: [TECHNICAL, MANAGEMENT, INTERNSHIP, GENERAL]
 *                 example: TECHNICAL
 *               hard_skills_weight:
 *                 type: number
 *                 format: float
 *                 example: 0.35
 *               soft_skills_weight:
 *                 type: number
 *                 format: float
 *                 example: 0.15
 *               experience_weight:
 *                 type: number
 *                 format: float
 *                 example: 0.20
 *               projects_weight:
 *                 type: number
 *                 format: float
 *                 example: 0.15
 *               education_weight:
 *                 type: number
 *                 format: float
 *                 example: 0.10
 *               volunteering_weight:
 *                 type: number
 *                 format: float
 *                 example: 0.05
 *     responses:
 *       200:
 *         description: Configuratia de scoring a fost actualizata cu succes
 *       400:
 *         description: Date invalide sau ponderi incorecte
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica aceasta configuratie
 *       404:
 *         description: Jobul sau configuratia de scoring nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.put(
  "/jobs/:id/scoring-config",
  authMiddleware,
  scoringConfigController.updateScoringConfig
);

module.exports = router;