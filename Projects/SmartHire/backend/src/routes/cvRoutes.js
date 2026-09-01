const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const upload = require("../middlewares/uploadMiddleware");
const cvController = require("../controllers/cvController");

/**
 * @swagger
 * tags:
 *   name: CVs
 *   description: Endpointuri pentru incarcarea, listarea, descarcarea si stergerea CV-urilor
 */

/**
 * @swagger
 * /api/cvs:
 *   post:
 *     summary: Incarca un CV
 *     description: Permite candidatului autentificat sa incarce un CV in format PDF. Fisierul este salvat pe server, iar textul este extras automat pentru analiza si scoring.
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: Fisier PDF care contine CV-ul candidatului
 *     responses:
 *       201:
 *         description: CV-ul a fost incarcat cu succes
 *       400:
 *         description: Fisier lipsa, format invalid sau date incorecte
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Acces permis doar candidatilor
 *       500:
 *         description: Eroare interna de server
 */
router.post("/cvs", authMiddleware, upload.single("cv"), cvController.uploadCv);

/**
 * @swagger
 * /api/cvs/my:
 *   get:
 *     summary: Listeaza CV-urile candidatului autentificat
 *     description: Returneaza toate CV-urile incarcate de candidatul autentificat.
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista CV-urilor a fost returnata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_cv:
 *                     type: integer
 *                     example: 1
 *                   id_candidat:
 *                     type: integer
 *                     example: 4
 *                   nume_fisier:
 *                     type: string
 *                     example: cv_andrei_popescu.pdf
 *                   cale_fisier:
 *                     type: string
 *                     example: uploads/cvs/cv-1716400000000.pdf
 *                   text_extras_raw:
 *                     type: string
 *                     example: Experienta in JavaScript, React, Node.js si SQL.
 *                   data_incarcare:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-05-26T10:30:00.000Z
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Acces permis doar candidatilor
 *       500:
 *         description: Eroare interna de server
 */
router.get("/cvs/my", authMiddleware, cvController.getMyCvs);

/**
 * @swagger
 * /api/cvs/{id}/download:
 *   get:
 *     summary: Descarca un CV
 *     description: Permite descarcarea unui CV pe baza ID-ului. Candidatul poate descarca propriul CV, iar recruiterii, managerii sau adminii pot avea acces in functie de regulile definite in controller.
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul CV-ului care va fi descarcat
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Fisierul CV a fost returnat cu succes
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a descarca acest CV
 *       404:
 *         description: CV-ul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get("/cvs/:id/download", authMiddleware, cvController.downloadCv);

/**
 * @swagger
 * /api/cvs/{id}:
 *   delete:
 *     summary: Sterge un CV
 *     description: Permite candidatului autentificat sa stearga un CV incarcat anterior. Operatiunea poate fi restrictionata daca CV-ul este deja folosit intr-o candidatura.
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul CV-ului care va fi sters
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: CV-ul a fost sters cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a sterge acest CV
 *       404:
 *         description: CV-ul nu a fost gasit
 *       409:
 *         description: CV-ul nu poate fi sters deoarece este folosit intr-o candidatura
 *       500:
 *         description: Eroare interna de server
 */
router.delete("/cvs/:id", authMiddleware, cvController.deleteCv);

module.exports = router;