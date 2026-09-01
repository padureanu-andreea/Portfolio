const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Endpointuri pentru gestionarea joburilor din aplicatia SmartHire
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Listeaza joburile
 *     description: Returneaza lista joburilor, filtrata automat in functie de rolul utilizatorului autentificat. Candidatul vede doar joburile active, recruiterul vede joburile create de el, managerul vede joburile departamentului sau, iar adminul vede toate joburile.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista joburilor a fost returnata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_job:
 *                     type: integer
 *                     example: 1
 *                   id_departament:
 *                     type: integer
 *                     example: 2
 *                   id_recrutor:
 *                     type: integer
 *                     example: 3
 *                   titlu_job:
 *                     type: string
 *                     example: Frontend Developer
 *                   descriere_job:
 *                     type: string
 *                     example: Cautam un dezvoltator React cu experienta in JavaScript.
 *                   salariu_minim:
 *                     type: number
 *                     example: 4500
 *                   salariu_maxim:
 *                     type: number
 *                     example: 7500
 *                   tara:
 *                     type: string
 *                     example: Romania
 *                   oras:
 *                     type: string
 *                     example: Bucuresti
 *                   mod_lucru:
 *                     type: string
 *                     enum: [REMOTE, HIBRID, FIZIC]
 *                     example: HIBRID
 *                   status:
 *                     type: string
 *                     example: ACTIV
 *                   data_publicare:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-05-26T10:00:00.000Z
 *       401:
 *         description: Token lipsa sau invalid
 *       500:
 *         description: Eroare interna de server
 */
router.get("/jobs", authMiddleware, jobController.getJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Returneaza un job dupa ID
 *     description: Returneaza detaliile unui job existent, pe baza ID-ului primit ca parametru.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Jobul a fost gasit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_job:
 *                   type: integer
 *                   example: 1
 *                 id_departament:
 *                   type: integer
 *                   example: 2
 *                 id_recrutor:
 *                   type: integer
 *                   example: 3
 *                 titlu_job:
 *                   type: string
 *                   example: Backend Developer
 *                 descriere_job:
 *                   type: string
 *                   example: Cautam un dezvoltator Node.js cu experienta in PostgreSQL.
 *                 salariu_minim:
 *                   type: number
 *                   example: 5000
 *                 salariu_maxim:
 *                   type: number
 *                   example: 8500
 *                 status:
 *                   type: string
 *                   example: DRAFT
 *                 data_publicare:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-05-26T10:00:00.000Z
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a vedea acest job
 *       404:
 *         description: Jobul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get("/jobs/:id", authMiddleware, jobController.getJobById);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Creeaza un job nou
 *     description: Creeaza un job nou in status DRAFT. De regula, jobul este creat de recruiter, urmand ca inainte de publicare sa fie analizat pentru formulari discriminatorii.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titlu_job
 *               - descriere_job
 *             properties:
 *               titlu_job:
 *                 type: string
 *                 example: Frontend Developer
 *               descriere_job:
 *                 type: string
 *                 example: Cautam un dezvoltator React cu experienta in JavaScript, HTML si CSS.
 *               tara:
 *                 type: string
 *                 example: Romania
 *               oras:
 *                 type: string
 *                 example: Bucuresti
 *               mod_lucru:
 *                 type: string
 *                 enum: [REMOTE, HIBRID, FIZIC]
 *                 example: HIBRID
 *               salariu_minim:
 *                 type: number
 *                 example: 4500
 *               salariu_maxim:
 *                 type: number
 *                 example: 7500
 *     responses:
 *       201:
 *         description: Jobul a fost creat cu succes
 *       400:
 *         description: Date invalide sau campuri obligatorii lipsa
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a crea joburi
 *       404:
 *         description: Departamentul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.post("/jobs", authMiddleware, jobController.createJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Actualizeaza un job
 *     description: Modifica datele unui job existent, pe baza ID-ului primit ca parametru. Poate fi folosit pentru editarea titlului, descrierii, salariului sau departamentului.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului care va fi actualizat
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
 *               id_departament:
 *                 type: integer
 *                 example: 2
 *               titlu_job:
 *                 type: string
 *                 example: Full Stack Developer
 *               descriere_job:
 *                 type: string
 *                 example: Cautam un dezvoltator cu experienta in React, Node.js si PostgreSQL.
 *               salariu_minim:
 *                 type: number
 *                 example: 5500
 *               salariu_maxim:
 *                 type: number
 *                 example: 9000
 *               tara:
 *                 type: string
 *                 example: Romania
 *               oras:
 *                 type: string
 *                 example: Cluj-Napoca
 *               mod_lucru:
 *                 type: string
 *                 enum: [REMOTE, HIBRID, FIZIC]
 *                 example: REMOTE
 *     responses:
 *       200:
 *         description: Jobul a fost actualizat cu succes
 *       400:
 *         description: Date invalide
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica acest job
 *       404:
 *         description: Jobul sau departamentul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.put("/jobs/:id", authMiddleware, jobController.updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Sterge un job
 *     description: Sterge un job existent din sistem. Operatiunea poate fi restrictionata daca jobul are candidaturi asociate.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului care va fi sters
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Jobul a fost sters cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a sterge acest job
 *       404:
 *         description: Jobul nu a fost gasit
 *       409:
 *         description: Jobul nu poate fi sters deoarece are date asociate
 *       500:
 *         description: Eroare interna de server
 */
router.delete("/jobs/:id", authMiddleware, jobController.deleteJob);

/**
 * @swagger
 * /api/jobs/{id}/publish:
 *   put:
 *     summary: Publica un job
 *     description: Publica un job aflat in status DRAFT si il trece in status ACTIV. Publicarea este permisa doar dupa realizarea analizei AI pentru bias.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului care va fi publicat
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Jobul a fost publicat cu succes
 *       400:
 *         description: Jobul nu poate fi publicat deoarece nu respecta conditiile necesare
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a publica acest job
 *       404:
 *         description: Jobul nu a fost gasit
 *       409:
 *         description: Jobul trebuie analizat AI inainte de publicare
 *       500:
 *         description: Eroare interna de server
 */
router.put("/jobs/:id/publish", authMiddleware, jobController.publishJob);

/**
 * @swagger
 * /api/jobs/{id}/close:
 *   put:
 *     summary: Inchide un job
 *     description: Inchide un job activ si il trece in status INCHIS. Dupa inchidere, jobul nu mai este disponibil pentru candidaturi noi.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului care va fi inchis
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Jobul a fost inchis cu succes
 *       400:
 *         description: Jobul nu poate fi inchis in starea curenta
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a inchide acest job
 *       404:
 *         description: Jobul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.put("/jobs/:id/close", authMiddleware, jobController.closeJob);

module.exports = router;
