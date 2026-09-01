const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const rankingController = require("../controllers/rankingController");

/**
 * @swagger
 * tags:
 *   name: Ranking
 *   description: Endpointuri pentru rankingul candidatilor si analiza candidaturilor
 */

/**
 * @swagger
 * /api/jobs/{id}/ranking:
 *   get:
 *     summary: Returneaza rankingul candidatilor pentru un job
 *     description: Returneaza lista candidatilor care au aplicat la un anumit job, ordonata descrescator dupa scorul de compatibilitate. Rankingul este folosit de recruiter, manager sau admin pentru analiza si compararea candidatilor.
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului pentru care se genereaza rankingul
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Rankingul candidatilor a fost returnat cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   pozitie:
 *                     type: integer
 *                     example: 1
 *                   id_aplicatie:
 *                     type: integer
 *                     example: 5
 *                   id_candidat:
 *                     type: integer
 *                     example: 8
 *                   nume:
 *                     type: string
 *                     example: Popescu
 *                   prenume:
 *                     type: string
 *                     example: Andrei
 *                   status:
 *                     type: string
 *                     example: IN_ANALIZA
 *                   scor_compatibilitate:
 *                     type: number
 *                     format: float
 *                     example: 88.7
 *                   rezumat_ai:
 *                     type: string
 *                     example: Candidatul are competente relevante in React, JavaScript si Node.js.
 *                   competente_lipsa:
 *                     type: string
 *                     example: '{"obligatorii":["React"],"optionale":["Docker","AWS"]}'
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a vedea rankingul acestui job
 *       404:
 *         description: Jobul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/jobs/:id/ranking",
  authMiddleware,
  rankingController.getJobRanking
);

/**
 * @swagger
 * /api/applications/{id}/analysis:
 *   get:
 *     summary: Returneaza analiza unei candidaturi
 *     description: Returneaza detaliile analizei pentru o candidatura, inclusiv scorul de compatibilitate, rezumatul AI, competentele lipsa si informatiile folosite in procesul de ranking.
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul candidaturii pentru care se returneaza analiza
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Analiza candidaturii a fost returnata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_aplicatie:
 *                   type: integer
 *                   example: 5
 *                 id_job:
 *                   type: integer
 *                   example: 1
 *                 id_candidat:
 *                   type: integer
 *                   example: 8
 *                 status:
 *                   type: string
 *                   example: IN_ANALIZA
 *                 scor_compatibilitate:
 *                   type: number
 *                   format: float
 *                   example: 88.7
 *                 rezumat_ai:
 *                   type: string
 *                   example: Candidatul are un profil potrivit pentru job, cu experienta relevanta in tehnologii web.
 *                 competente_lipsa:
 *                   type: string
 *                   example: '{"obligatorii":["SQL"],"optionale":["Docker"]}'
 *                 detalii_scor:
 *                   type: object
 *                   properties:
 *                     scor_clasic:
 *                       type: number
 *                       format: float
 *                       example: 84.5
 *                     scor_semantic_ai:
 *                       type: number
 *                       format: float
 *                       example: 92.0
 *                     pondere_scor_clasic:
 *                       type: number
 *                       format: float
 *                       example: 70
 *                     pondere_scor_semantic:
 *                       type: number
 *                       format: float
 *                       example: 30
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a vedea analiza acestei candidaturi
 *       404:
 *         description: Candidatura nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/applications/:id/analysis",
  authMiddleware,
  rankingController.getApplicationAnalysis
);

module.exports = router;
