const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const jobBiasController = require("../controllers/jobBiasController");

/**
 * @swagger
 * tags:
 *   name: Job Bias Analysis
 *   description: Endpointuri pentru analiza AI a formularilor potential discriminatorii din anunturile de job
 */

/**
 * @swagger
 * /api/jobs/{id}/analyze-bias:
 *   post:
 *     summary: Analizeaza un job pentru formulari discriminatorii
 *     description: Ruleaza analiza AI asupra descrierii unui job pentru a detecta formulari potential discriminatorii sau neincluzive. Rezultatul este salvat in tabela de analiza a jobului.
 *     tags: [Job Bias Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului care va fi analizat
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Analiza de bias a fost realizata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_analiza_job:
 *                   type: integer
 *                   example: 1
 *                 id_job:
 *                   type: integer
 *                   example: 1
 *                 has_bias:
 *                   type: boolean
 *                   example: true
 *                 bias_detectat:
 *                   type: string
 *                   example: Au fost identificate formulari care pot sugera preferinte legate de varsta.
 *                 sugestii_reformulare:
 *                   type: string
 *                   example: Se recomanda reformularea cerintei intr-un mod neutru si incluziv.
 *       400:
 *         description: Jobul nu poate fi analizat din cauza datelor invalide
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a analiza acest job
 *       404:
 *         description: Jobul nu a fost gasit
 *       500:
 *         description: Eroare interna de server sau eroare la comunicarea cu serviciul AI
 */
router.post(
  "/jobs/:id/analyze-bias",
  authMiddleware,
  jobBiasController.analyzeJobBias
);

/**
 * @swagger
 * /api/jobs/{id}/bias-analysis:
 *   get:
 *     summary: Returneaza analiza de bias a unui job
 *     description: Returneaza rezultatul analizei AI pentru un anumit job, inclusiv biasul detectat si sugestiile de reformulare.
 *     tags: [Job Bias Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului pentru care se cauta analiza de bias
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Analiza de bias a fost returnata cu succes sau null daca nu exista inca
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_analiza_job:
 *                   type: integer
 *                   example: 1
 *                 id_job:
 *                   type: integer
 *                   example: 1
 *                 has_bias:
 *                   type: boolean
 *                   example: false
 *                 bias_detectat:
 *                   type: string
 *                   example: Nu au fost identificate formulari discriminatorii evidente.
 *                 sugestii_reformulare:
 *                   type: string
 *                   example: Textul poate fi pastrat, dar se recomanda mentinerea unui limbaj neutru.
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a vedea analiza acestui job
 *       404:
 *         description: Jobul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/jobs/:id/bias-analysis",
  authMiddleware,
  jobBiasController.getJobBiasAnalysis
);

/**
 * @swagger
 * /api/jobs/{id}/apply-ai-rewrite:
 *   put:
 *     summary: Aplica reformularea AI asupra descrierii jobului
 *     description: Inlocuieste descrierea initiala a jobului cu varianta reformulata de AI, in urma analizei de bias. Acest pas poate fi folosit inainte de publicarea jobului.
 *     tags: [Job Bias Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului pentru care se aplica reformularea AI
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Reformularea AI a fost aplicata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Descrierea jobului a fost actualizata cu reformularea AI.
 *                 id_job:
 *                   type: integer
 *                   example: 1
 *                 descriere_job:
 *                   type: string
 *                   example: Cautam o persoana cu abilitati de comunicare, atentie la detalii si dorinta de dezvoltare profesionala.
 *       400:
 *         description: Nu exista o reformulare AI disponibila pentru acest job
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica acest job
 *       404:
 *         description: Jobul sau analiza de bias nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.put(
  "/jobs/:id/apply-ai-rewrite",
  authMiddleware,
  jobBiasController.applyAiRewrite
);

module.exports = router;
