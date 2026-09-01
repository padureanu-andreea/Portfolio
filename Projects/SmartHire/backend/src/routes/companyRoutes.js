const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const companyController = require("../controllers/companyController");

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Endpointuri pentru compania unica a aplicatiei SmartHire
 */

/**
 * @swagger
 * /api/company:
 *   get:
 *     summary: Returneaza compania configurata
 *     description: Returneaza singura companie existenta in baza de date.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compania a fost returnata cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       404:
 *         description: Compania nu exista
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/company",
  authMiddleware,
  companyController.getCompany
);

/**
 * @swagger
 * /api/company:
 *   post:
 *     summary: Creeaza compania aplicatiei
 *     description: Creeaza compania unica a aplicatiei. Endpoint permis doar administratorilor si doar daca nu exista deja o companie.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/company",
  authMiddleware,
  companyController.createCompany
);

/**
 * @swagger
 * /api/company:
 *   put:
 *     summary: Actualizeaza compania aplicatiei
 *     description: Actualizeaza singura companie existenta in baza de date. Endpoint permis doar administratorilor.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/company",
  authMiddleware,
  companyController.updateCompany
);

module.exports = router;