const express = require("express");
const router = express.Router();

const authMiddleware =
  require("../middlewares/authMiddleware");

const feedbackController =
  require("../controllers/feedbackController");

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Endpointuri pentru gestionarea feedbackului asociat interviurilor
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Creeaza feedback pentru un interviu
 *     description: Permite adaugarea unui feedback pentru un interviu. Feedbackul este folosit intern de recruiter sau manager si nu este vizibil candidatului.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_interviu
 *               - continut_feedback
 *             properties:
 *               id_interviu:
 *                 type: integer
 *                 example: 1
 *               continut_feedback:
 *                 type: string
 *                 example: Candidatul a demonstrat cunostinte bune de React si o comunicare clara.
 *               rating_candidat:
 *                 type: number
 *                 format: float
 *                 example: 8.5
 *               recomandare_finala:
 *                 type: string
 *                 example: Recomandat pentru etapa urmatoare.
 *     responses:
 *       201:
 *         description: Feedbackul a fost creat cu succes
 *       400:
 *         description: Date invalide sau campuri obligatorii lipsa
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a crea feedback
 *       404:
 *         description: Interviul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.post(
  "/feedback",
  authMiddleware,
  feedbackController.createFeedback
);

/**
 * @swagger
 * /api/interviews/{id}/feedback:
 *   get:
 *     summary: Returneaza feedbackul unui interviu
 *     description: Returneaza feedbackul asociat unui anumit interviu, pe baza ID-ului primit ca parametru.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul interviului pentru care se cauta feedbackul
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Feedbackul interviului a fost returnat cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_feedback:
 *                   type: integer
 *                   example: 1
 *                 id_interviu:
 *                   type: integer
 *                   example: 1
 *                 id_utilizator:
 *                   type: integer
 *                   example: 5
 *                 continut_feedback:
 *                   type: string
 *                   example: Candidatul s-a descurcat bine la intrebarile tehnice.
 *                 rating_candidat:
 *                   type: number
 *                   format: float
 *                   example: 8.5
 *                 recomandare_finala:
 *                   type: string
 *                   example: Recomandat pentru etapa urmatoare.
 *                 data_feedback:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-05-26T12:30:00.000Z
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a vedea feedbackul acestui interviu
 *       404:
 *         description: Interviul sau feedbackul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/interviews/:id/feedback",
  authMiddleware,
  feedbackController.getInterviewFeedback
);

/**
 * @swagger
 * /api/feedback/{id}:
 *   put:
 *     summary: Actualizeaza un feedback
 *     description: Permite modificarea unui feedback existent, pe baza ID-ului primit ca parametru.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul feedbackului care va fi actualizat
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
 *               continut_feedback:
 *                 type: string
 *                 example: Candidatul are competente tehnice bune, dar are nevoie de mai multa experienta practica.
 *               rating_candidat:
 *                 type: number
 *                 format: float
 *                 example: 7.8
 *               recomandare_finala:
 *                 type: string
 *                 example: Recomandat cu rezerve.
 *     responses:
 *       200:
 *         description: Feedbackul a fost actualizat cu succes
 *       400:
 *         description: Date invalide
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica acest feedback
 *       404:
 *         description: Feedbackul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.put(
  "/feedback/:id",
  authMiddleware,
  feedbackController.updateFeedback
);

/**
 * @swagger
 * /api/feedback/{id}:
 *   delete:
 *     summary: Sterge un feedback
 *     description: Sterge feedbackul existent, pe baza ID-ului primit ca parametru.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul feedbackului care va fi sters
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Feedbackul a fost sters cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a sterge acest feedback
 *       404:
 *         description: Feedbackul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.delete(
  "/feedback/:id",
  authMiddleware,
  feedbackController.deleteFeedback
);

module.exports = router;
