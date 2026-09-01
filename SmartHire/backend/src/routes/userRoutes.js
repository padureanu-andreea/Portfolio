const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/users/staff:
 *   post:
 *     summary: Creeaza un cont staff
 *     description: Permite doar administratorilor sa creeze conturi pentru recrutori sau manageri. Conturile de candidat se creeaza prin endpointul public de register, iar conturile de admin se creeaza prin seed sau administrare interna.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nume
 *               - prenume
 *               - email
 *               - parola
 *               - rol
 *             properties:
 *               nume:
 *                 type: string
 *                 example: Popescu
 *               prenume:
 *                 type: string
 *                 example: Maria
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria.recrutor@smarthire.com
 *               parola:
 *                 type: string
 *                 format: password
 *                 example: Parola123!
 *               rol:
 *                 type: string
 *                 enum: [RECRUTOR, MANAGER]
 *                 example: RECRUTOR
 *     responses:
 *       201:
 *         description: Cont staff creat cu succes
 *       400:
 *         description: Date invalide, campuri lipsa, rol invalid sau email deja utilizat
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Acces permis doar administratorilor
 *       500:
 *         description: Eroare interna de server
 */
router.post("/users/staff", authMiddleware, userController.createStaffUser);

router.get("/profile", authMiddleware, userController.getMyProfile);

router.put("/profile", authMiddleware, userController.updateMyProfile);

router.put(
  "/profile/password",
  authMiddleware,
  userController.changeMyPassword
);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpointuri pentru administrarea utilizatorilor din aplicatia SmartHire
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listeaza toti utilizatorii
 *     description: Returneaza lista utilizatorilor existenti in sistem. Endpoint destinat administrarii utilizatorilor, accesibil de regula doar utilizatorilor cu rol ADMIN.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista utilizatorilor a fost returnata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_utilizator:
 *                     type: integer
 *                     example: 1
 *                   nume:
 *                     type: string
 *                     example: Popescu
 *                   prenume:
 *                     type: string
 *                     example: Andrei
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: andrei.popescu@email.com
 *                   rol:
 *                     type: string
 *                     example: CANDIDAT
 *                   data_creare:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-05-26T10:00:00.000Z
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Acces permis doar administratorilor
 *       500:
 *         description: Eroare interna de server
 */
router.get("/users", authMiddleware, userController.getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Returneaza un utilizator dupa ID
 *     description: Returneaza detaliile unui utilizator existent, pe baza ID-ului primit ca parametru.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul utilizatorului
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Utilizatorul a fost gasit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_utilizator:
 *                   type: integer
 *                   example: 1
 *                 nume:
 *                   type: string
 *                   example: Popescu
 *                 prenume:
 *                   type: string
 *                   example: Andrei
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: andrei.popescu@email.com
 *                 rol:
 *                   type: string
 *                   example: CANDIDAT
 *                 data_creare:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-05-26T10:00:00.000Z
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a vedea aceste date
 *       404:
 *         description: Utilizatorul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get("/users/:id", authMiddleware, userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizeaza un utilizator staff
 *     description: Permite administratorului sa editeze datele unui cont de recruiter sau manager, inclusiv rolul si departamentul asociat. Daca parola este trimisa, aceasta este actualizata.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul utilizatorului care va fi actualizat
 *         schema:
 *           type: integer
 *         example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nume
 *               - prenume
 *               - email
 *               - rol
 *               - id_departament
 *             properties:
 *               nume:
 *                 type: string
 *                 example: Popescu
 *               prenume:
 *                 type: string
 *                 example: Maria
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria.manager@smarthire.com
 *               parola:
 *                 type: string
 *                 format: password
 *                 example: ParolaNoua123!
 *               rol:
 *                 type: string
 *                 enum: [RECRUTOR, MANAGER]
 *                 example: MANAGER
 *               id_departament:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Utilizatorul a fost actualizat cu succes
 *       400:
 *         description: Date invalide, email deja utilizat sau departament ocupat de alt recrutor
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Acces permis doar administratorilor
 *       404:
 *         description: Utilizatorul sau departamentul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.put("/users/:id", authMiddleware, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Sterge un utilizator
 *     description: Sterge un utilizator existent din sistem. Adminul nu isi poate sterge propriul cont, conform regulilor aplicatiei.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul utilizatorului care va fi sters
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: Utilizatorul a fost sters cu succes
 *       400:
 *         description: Administratorul nu isi poate sterge propriul cont
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Acces permis doar administratorilor
 *       404:
 *         description: Utilizatorul nu a fost gasit
 *       409:
 *         description: Utilizatorul nu poate fi sters deoarece are date asociate
 *       500:
 *         description: Eroare interna de server
 */
router.delete("/users/:id", authMiddleware, userController.deleteUser);

module.exports = router;
