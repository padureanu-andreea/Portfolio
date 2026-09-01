const express = require("express");
const router = express.Router();

const authMiddleware =
  require("../middlewares/authMiddleware");

const interviewController =
  require("../controllers/interviewController");

/**
 * @swagger
 * tags:
 *   name: Interviews
 *   description: Endpointuri pentru programarea si gestionarea interviurilor
 */

/**
 * @swagger
 * /api/interviews:
 *   post:
 *     summary: Creeaza un interviu
 *     description: Permite programarea unui interviu pentru o candidatura existenta. Interviul poate include data, tipul interviului si linkul de meeting.
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_aplicatie
 *               - data_interviu
 *             properties:
 *               id_aplicatie:
 *                 type: integer
 *                 example: 1
 *               data_interviu:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-30T10:00:00.000Z
 *               tip_interviu:
 *                 type: string
 *                 enum: [HR_ONLINE, HR_FIZIC, HR_TELEFONIC, TEHNIC_ONLINE, TEHNIC_FIZIC]
 *                 example: HR_ONLINE
 *               link_meeting:
 *                 type: string
 *                 example: https://meet.google.com/abc-defg-hij
 *     responses:
 *       201:
 *         description: Interviul a fost creat cu succes
 *       400:
 *         description: Date invalide sau campuri obligatorii lipsa
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a crea interviuri
 *       404:
 *         description: Candidatura nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.post(
  "/interviews",
  authMiddleware,
  interviewController.createInterview
);

/**
 * @swagger
 * /api/interviews/{id}:
 *   put:
 *     summary: Actualizeaza un interviu
 *     description: Permite modificarea datelor unui interviu existent, precum data, tipul, linkul de meeting sau statusul.
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul interviului care va fi actualizat
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
 *               data_interviu:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-01T14:00:00.000Z
 *               tip_interviu:
 *                 type: string
 *                 enum: [HR_ONLINE, HR_FIZIC, HR_TELEFONIC, TEHNIC_ONLINE, TEHNIC_FIZIC]
 *                 example: TEHNIC_ONLINE
 *               link_meeting:
 *                 type: string
 *                 example: https://meet.google.com/xyz-abcd-efg
 *               status:
 *                 type: string
 *                 enum: [PROGRAMAT, FINALIZAT, ANULAT, REPROGRAMARE_SOLICITATA, NEPREZENTAT]
 *                 example: PROGRAMAT
 *     responses:
 *       200:
 *         description: Interviul a fost actualizat cu succes
 *       400:
 *         description: Date invalide
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica acest interviu
 *       404:
 *         description: Interviul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.put(
  "/interviews/:id",
  authMiddleware,
  interviewController.updateInterview
);

router.put(
  "/interviews/:id/cancel",
  authMiddleware,
  interviewController.cancelInterviewByCandidate
);

router.put(
  "/interviews/:id/request-reschedule",
  authMiddleware,
  interviewController.requestInterviewReschedule
);

router.put(
  "/interviews/:id/mark-no-show",
  authMiddleware,
  interviewController.markInterviewNoShow
);

/**
 * @swagger
 * /api/interviews/{id}:
 *   delete:
 *     summary: Sterge un interviu
 *     description: Sterge un interviu existent din sistem, pe baza ID-ului primit ca parametru.
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul interviului care va fi sters
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Interviul a fost sters cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a sterge acest interviu
 *       404:
 *         description: Interviul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.delete(
  "/interviews/:id",
  authMiddleware,
  interviewController.deleteInterview
);

router.get(
  "/interviews/my",
  authMiddleware,
  interviewController.getMyInterviews
);

/**
 * @swagger
 * /api/jobs/{id}/interviews:
 *   get:
 *     summary: Listeaza interviurile pentru un job
 *     description: Returneaza toate interviurile asociate candidaturilor pentru un anumit job.
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului pentru care se listeaza interviurile
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista interviurilor a fost returnata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_interviu:
 *                     type: integer
 *                     example: 1
 *                   id_aplicatie:
 *                     type: integer
 *                     example: 4
 *                   id_organizator:
 *                     type: integer
 *                     example: 2
 *                   data_interviu:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-05-30T10:00:00.000Z
 *                   tip_interviu:
 *                     type: string
 *                     example: HR_ONLINE
 *                   link_meeting:
 *                     type: string
 *                     example: https://meet.google.com/abc-defg-hij
 *                   status:
 *                     type: string
 *                     example: PROGRAMAT
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a vedea interviurile acestui job
 *       404:
 *         description: Jobul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/jobs/:id/interviews",
  authMiddleware,
  interviewController.getJobInterviews
);

module.exports = router;
