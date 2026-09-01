const express = require("express");
const router = express.Router();

const applicationController = require("../controllers/applicationController");

const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Endpointuri pentru gestionarea candidaturilor la joburi
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Creeaza o candidatura noua
 *     description: Permite unui candidat autentificat sa aplice la un job folosind un CV incarcat anterior. Se genereaza scorul de compatibilitate si analiza asociata aplicatiei.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_job
 *               - id_cv
 *             properties:
 *               id_job:
 *                 type: integer
 *                 example: 1
 *               id_cv:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Candidatura a fost creata cu succes
 *       400:
 *         description: Date invalide, campuri lipsa sau candidatura exista deja
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Acces interzis pentru acest rol
 *       404:
 *         description: Jobul sau CV-ul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.post("/applications", authMiddleware, applicationController.createApplication);

/**
 * @swagger
 * /api/applications/my:
 *   get:
 *     summary: Listeaza candidaturile candidatului autentificat
 *     description: Returneaza toate candidaturile depuse de candidatul autentificat, impreuna cu informatii despre job, status si scor.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista candidaturilor candidatului autentificat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_aplicatie:
 *                     type: integer
 *                     example: 1
 *                   id_job:
 *                     type: integer
 *                     example: 2
 *                   titlu_job:
 *                     type: string
 *                     example: Frontend Developer
 *                   status:
 *                     type: string
 *                     example: IN_ANALIZA
 *                   scor_compatibilitate:
 *                     type: number
 *                     format: float
 *                     example: 82.5
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Acces permis doar candidatilor
 *       500:
 *         description: Eroare interna de server
 */
router.get("/applications/my", authMiddleware, applicationController.getMyApplications);

/**
 * @swagger
 * /api/jobs/{id}/applications:
 *   get:
 *     summary: Listeaza candidaturile pentru un job
 *     description: Returneaza candidaturile depuse pentru un anumit job. Recruiterul vede doar candidaturile pentru joburile create de el in departamentul lui, managerul vede candidaturile joburilor din departamentul lui, iar adminul vede toate candidaturile.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului pentru care se listeaza candidaturile
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista candidaturilor pentru jobul selectat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_aplicatie:
 *                     type: integer
 *                     example: 4
 *                   id_candidat:
 *                     type: integer
 *                     example: 7
 *                   status:
 *                     type: string
 *                     example: DEPUSA
 *                   scor_compatibilitate:
 *                     type: number
 *                     format: float
 *                     example: 76.4
 *                   rezumat_ai:
 *                     type: string
 *                     example: Candidatul are experienta relevanta in JavaScript si React.
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are dreptul sa vada candidaturile acestui job
 *       404:
 *         description: Jobul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get("/jobs/:id/applications", authMiddleware, applicationController.getJobApplications);

/**
 * @swagger
 * /api/applications/{id}/status:
 *   put:
 *     summary: Actualizeaza statusul unei candidaturi
 *     description: Permite recruiterului, managerului sau adminului sa modifice statusul unei candidaturi. Candidatul primeste notificare automata la schimbarea statusului.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul candidaturii
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DEPUSA, IN_ANALIZA, ACCEPTATA, RESPINSA]
 *                 example: ACCEPTATA
 *     responses:
 *       200:
 *         description: Statusul candidaturii a fost actualizat cu succes
 *       400:
 *         description: Status invalid sau camp lipsa
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica aceasta candidatura
 *       404:
 *         description: Candidatura nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.put("/applications/:id/status", authMiddleware, applicationController.updateApplicationStatus);

/**
 * @swagger
 * /api/applications/{id}/withdraw:
 *   put:
 *     summary: Retrage o candidatura
 *     description: Permite candidatului autentificat sa isi retraga propria candidatura. Statusul candidaturii este actualizat, iar recruiterul poate fi notificat.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul candidaturii care va fi retrasa
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Candidatura a fost retrasa cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu poate retrage aceasta candidatura
 *       404:
 *         description: Candidatura nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.put("/applications/:id/withdraw", authMiddleware, applicationController.withdrawApplication);

/**
 * @swagger
 * /api/applications/{id}/details:
 *   get:
 *     summary: Returneaza detaliile unei candidaturi
 *     description: Returneaza informatii detaliate despre o candidatura, inclusiv jobul, CV-ul folosit, statusul, scorul de compatibilitate, rezumatul AI si eventualele informatii despre interviu.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul candidaturii
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Detaliile candidaturii
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_aplicatie:
 *                   type: integer
 *                   example: 1
 *                 status:
 *                   type: string
 *                   example: IN_ANALIZA
 *                 scor_compatibilitate:
 *                   type: number
 *                   format: float
 *                   example: 84.2
 *                 rezumat_ai:
 *                   type: string
 *                   example: Candidatul are un profil potrivit pentru pozitie.
 *                 competente_lipsa:
 *                   type: string
 *                   example: '{"obligatorii":["SQL"],"optionale":["Docker"]}'
 *                 job:
 *                   type: object
 *                   properties:
 *                     id_job:
 *                       type: integer
 *                       example: 2
 *                     titlu_job:
 *                       type: string
 *                       example: Backend Developer
 *                 cv:
 *                   type: object
 *                   properties:
 *                     id_cv:
 *                       type: integer
 *                       example: 5
 *                     nume_fisier:
 *                       type: string
 *                       example: cv_popescu_andrei.pdf
 *                 interviu:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id_interviu:
 *                       type: integer
 *                       example: 3
 *                     data_interviu:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-05-30T10:00:00.000Z
 *                     status:
 *                       type: string
 *                       example: PROGRAMAT
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are acces la detaliile acestei candidaturi
 *       404:
 *         description: Candidatura nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.get("/applications/:id/details", authMiddleware, applicationController.getApplicationDetails);

module.exports = router;
