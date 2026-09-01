const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const aiController = require("../controllers/aiController");

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: Endpointuri pentru testarea analizelor AI utilizate in SmartHire
 */

/**
 * @swagger
 * /api/ai/test-analysis:
 *   post:
 *     summary: Testeaza analiza semantica AI
 *     description: Permite testarea analizei AI dintre descrierea unui job si textul unui CV. Endpointul returneaza scor semantic, competente detectate, competente lipsa, recomandare si rezumat AI.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobDescription
 *               - cvText
 *             properties:
 *               jobDescription:
 *                 type: string
 *                 example: Cautam un dezvoltator React cu experienta in JavaScript, Node.js si SQL.
 *               cvText:
 *                 type: string
 *                 example: Am experienta in dezvoltarea aplicatiilor web folosind React, JavaScript, Node.js si PostgreSQL.
 *               candidateProfile:
 *                 type: string
 *                 example: Candidat junior cu experienta in proiecte web si lucru in echipa.
 *     responses:
 *       200:
 *         description: Analiza AI a fost realizata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 semantic_score:
 *                   type: number
 *                   format: float
 *                   example: 86.5
 *                 detected_skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [React, JavaScript, Node.js, SQL]
 *                 missing_skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [Docker, TypeScript]
 *                 recommendation:
 *                   type: string
 *                   example: Candidatul este potrivit pentru etapa urmatoare a procesului de recrutare.
 *                 summary:
 *                   type: string
 *                   example: Candidatul are competente relevante pentru pozitie, in special pe zona de frontend si backend JavaScript.
 *       400:
 *         description: Date invalide sau campuri obligatorii lipsa
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Acces interzis pentru acest rol
 *       500:
 *         description: Eroare interna de server sau eroare la comunicarea cu serviciul AI
 */
router.post(
  "/ai/test-analysis",
  authMiddleware,
  aiController.testAiAnalysis
);

module.exports = router;