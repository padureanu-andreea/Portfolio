const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middlewares/authMiddleware");

const profileController =
  require("../controllers/profileController");

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Endpointuri pentru gestionarea profilului utilizatorului autentificat
 */

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Creeaza profilul utilizatorului autentificat
 *     description: Creeaza profilul asociat utilizatorului autentificat, in functie de rolul acestuia. Poate fi folosit pentru completarea datelor specifice candidatului, recrutorului sau managerului.
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_companie:
 *                 type: integer
 *                 example: 1
 *               id_departament:
 *                 type: integer
 *                 example: 2
 *               functie:
 *                 type: string
 *                 example: Recruiter HR
 *               disponibilitate:
 *                 type: string
 *                 example: Disponibil pentru interviuri in timpul saptamanii
 *     responses:
 *       201:
 *         description: Profilul a fost creat cu succes
 *       400:
 *         description: Date invalide, campuri lipsa sau profil deja existent
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a crea acest tip de profil
 *       404:
 *         description: Compania sau departamentul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.post(
  "/profile",
  authMiddleware,
  profileController.createProfile
);

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Returneaza profilul utilizatorului autentificat
 *     description: Returneaza profilul propriu al utilizatorului autentificat, in functie de rolul sau in aplicatie.
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profilul a fost returnat cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_utilizator:
 *                   type: integer
 *                   example: 1
 *                 rol:
 *                   type: string
 *                   example: CANDIDAT
 *                 profil:
 *                   type: object
 *                   properties:
 *                     id_candidat:
 *                       type: integer
 *                       example: 3
 *                     disponibilitate:
 *                       type: string
 *                       example: Disponibil pentru interviuri online
 *       401:
 *         description: Token lipsa sau invalid
 *       404:
 *         description: Profilul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/profile/me",
  authMiddleware,
  profileController.getMyProfile
);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Actualizeaza profilul utilizatorului autentificat
 *     description: Modifica profilul propriu al utilizatorului autentificat. Campurile disponibile pot varia in functie de rolul utilizatorului.
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_companie:
 *                 type: integer
 *                 example: 1
 *               id_departament:
 *                 type: integer
 *                 example: 2
 *               functie:
 *                 type: string
 *                 example: Manager departament IT
 *               disponibilitate:
 *                 type: string
 *                 example: Disponibil pentru interviuri dupa ora 16:00
 *     responses:
 *       200:
 *         description: Profilul a fost actualizat cu succes
 *       400:
 *         description: Date invalide
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica acest profil
 *       404:
 *         description: Profilul, compania sau departamentul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.put(
  "/profile",
  authMiddleware,
  profileController.updateProfile
);

/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Sterge profilul utilizatorului autentificat
 *     description: Sterge profilul asociat utilizatorului autentificat. Operatiunea poate fi restrictionata daca profilul are date asociate, precum CV-uri, joburi, candidaturi sau interviuri.
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profilul a fost sters cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a sterge acest profil
 *       404:
 *         description: Profilul nu a fost gasit
 *       409:
 *         description: Profilul nu poate fi sters deoarece are date asociate
 *       500:
 *         description: Eroare interna de server
 */
router.delete(
  "/profile",
  authMiddleware,
  profileController.deleteProfile
);

module.exports = router;