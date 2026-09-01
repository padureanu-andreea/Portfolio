const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const departmentController = require("../controllers/departmentController");

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Endpointuri pentru gestionarea departamentelor companiilor
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Listeaza toate departamentele
 *     description: Returneaza lista tuturor departamentelor existente in sistem.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista departamentelor a fost returnata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_departament:
 *                     type: integer
 *                     example: 1
 *                   id_companie:
 *                     type: integer
 *                     example: 2
 *                   nume_departament:
 *                     type: string
 *                     example: IT
 *       401:
 *         description: Token lipsa sau invalid
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/departments",
  authMiddleware,
  departmentController.getAllDepartments
);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Returneaza un departament dupa ID
 *     description: Returneaza detaliile unui departament pe baza ID-ului primit ca parametru.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul departamentului
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Departamentul a fost gasit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_departament:
 *                   type: integer
 *                   example: 1
 *                 id_companie:
 *                   type: integer
 *                   example: 2
 *                 nume_departament:
 *                   type: string
 *                   example: Resurse Umane
 *       401:
 *         description: Token lipsa sau invalid
 *       404:
 *         description: Departamentul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/departments/:id",
  authMiddleware,
  departmentController.getDepartmentById
);

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Creeaza un departament nou
 *     description: Adauga un departament nou pentru compania unica configurata in aplicatie.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nume_departament
 *             properties:
 *               nume_departament:
 *                 type: string
 *                 example: IT
 *     responses:
 *       201:
 *         description: Departamentul a fost creat cu succes
 *       400:
 *         description: Date invalide sau campuri obligatorii lipsa
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a crea departamente
 *       404:
 *         description: Compania nu a fost gasita
 *       409:
 *         description: Exista deja un departament cu aceste date
 *       500:
 *         description: Eroare interna de server
 */
router.post(
  "/departments",
  authMiddleware,
  departmentController.createDepartment
);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Actualizeaza un departament
 *     description: Modifica datele unui departament existent, pe baza ID-ului primit ca parametru.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul departamentului care va fi actualizat
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
 *               nume_departament:
 *                 type: string
 *                 example: Marketing
 *     responses:
 *       200:
 *         description: Departamentul a fost actualizat cu succes
 *       400:
 *         description: Date invalide
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica acest departament
 *       404:
 *         description: Departamentul sau compania nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.put(
  "/departments/:id",
  authMiddleware,
  departmentController.updateDepartment
);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Sterge un departament
 *     description: Sterge un departament existent din sistem. Operatiunea poate fi restrictionata daca departamentul are manageri sau joburi asociate.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul departamentului care va fi sters
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Departamentul a fost sters cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a sterge acest departament
 *       404:
 *         description: Departamentul nu a fost gasit
 *       409:
 *         description: Departamentul nu poate fi sters deoarece are date asociate
 *       500:
 *         description: Eroare interna de server
 */
router.delete(
  "/departments/:id",
  authMiddleware,
  departmentController.deleteDepartment
);

module.exports = router;