const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const scoringController = require("../controllers/scoringController");

/**
 * @swagger
 * tags:
 *   name: Scoring
 *   description: Endpointuri pentru calcularea scorului de compatibilitate al candidaturilor
 */

/**
 * @swagger
 * /api/applications/{id}/calculate-score:
 *   post:
 *     summary: Calculeaza scorul unei candidaturi
 *     description: Calculeaza scorul de compatibilitate pentru o candidatura existenta, folosind scoring hibrid. Sistemul combina reguli de business, criterii AHP, potrivirea competentelor si analiza semantica AI.
 *     tags: [Scoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul candidaturii pentru care se calculeaza scorul
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Scorul candidaturii a fost calculat cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_aplicatie:
 *                   type: integer
 *                   example: 1
 *                 scor_compatibilitate:
 *                   type: number
 *                   format: float
 *                   example: 86.4
 *                 rezumat_ai:
 *                   type: string
 *                   example: Candidatul are competente relevante pentru pozitie, in special pe zona de JavaScript, React si Node.js.
 *                 competente_lipsa:
 *                   type: string
 *                   example: '{"obligatorii":["React"],"optionale":["Docker","AWS"]}'
 *                 detalii_scor:
 *                   type: object
 *                   properties:
 *                     scor_clasic:
 *                       type: number
 *                       format: float
 *                       example: 82.0
 *                     scor_semantic_ai:
 *                       type: number
 *                       format: float
 *                       example: 96.5
 *                     pondere_scor_clasic:
 *                       type: number
 *                       format: float
 *                       example: 70
 *                     pondere_scor_semantic_ai:
 *                       type: number
 *                       format: float
 *                       example: 30
 *       400:
 *         description: Candidatura nu poate fi evaluata din cauza datelor lipsa sau invalide
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a calcula scorul acestei candidaturi
 *       404:
 *         description: Candidatura nu a fost gasita
 *       500:
 *         description: Eroare interna de server sau eroare la calculul scorului
 */
router.post(
  "/applications/:id/calculate-score",
  authMiddleware,
  scoringController.calculateApplicationScore
);

/**
 * @swagger
 * /api/jobs/{id}/calculate-missing-scores:
 *   post:
 *     summary: Calculeaza scorurile lipsa pentru candidaturile unui job
 *     description: Calculeaza automat scorul pentru toate candidaturile active ale unui job care nu au inca scor de compatibilitate.
 *     tags: [Scoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului pentru care se calculeaza scorurile lipsa
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Scorurile au fost calculate sau nu exista candidaturi fara scor
 *       400:
 *         description: Jobul nu are competente asociate
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a calcula scoruri pentru acest job
 *       404:
 *         description: Jobul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.post(
  "/jobs/:id/calculate-missing-scores",
  authMiddleware,
  scoringController.calculateMissingScoresForJob
);

module.exports = router;
