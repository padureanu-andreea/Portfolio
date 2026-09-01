const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middlewares/authMiddleware");

const cvSkillController =
  require("../controllers/cvSkillController");

/**
 * @swagger
 * tags:
 *   name: CV Skills
 *   description: Endpointuri pentru gestionarea competentelor asociate CV-urilor
 */

/**
 * @swagger
 * /api/cvs/{id}/skills:
 *   post:
 *     summary: Adauga o competenta la un CV
 *     description: Permite adaugarea manuala a unei competente la un CV existent. Competenta poate fi asociata cu anii de experienta ai candidatului.
 *     tags: [CV Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul CV-ului la care se adauga competenta
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
 *               - id_competenta
 *             properties:
 *               id_competenta:
 *                 type: integer
 *                 example: 3
 *               ani_experienta:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Competenta a fost adaugata cu succes la CV
 *       400:
 *         description: Date invalide sau campuri obligatorii lipsa
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica acest CV
 *       404:
 *         description: CV-ul sau competenta nu a fost gasita
 *       409:
 *         description: Competenta este deja asociata acestui CV
 *       500:
 *         description: Eroare interna de server
 */
router.post(
  "/cvs/:id/skills",
  authMiddleware,
  cvSkillController.addSkillToCv
);

/**
 * @swagger
 * /api/cvs/{id}/skills:
 *   get:
 *     summary: Listeaza competentele unui CV
 *     description: Returneaza competentele asociate unui CV, inclusiv informatii despre anii de experienta, daca acestea exista.
 *     tags: [CV Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul CV-ului pentru care se listeaza competentele
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista competentelor CV-ului a fost returnata cu succes
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
 *                   id_competenta:
 *                     type: integer
 *                     example: 3
 *                   nume_competenta:
 *                     type: string
 *                     example: JavaScript
 *                   ani_experienta:
 *                     type: integer
 *                     example: 2
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a vedea competentele acestui CV
 *       404:
 *         description: CV-ul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/cvs/:id/skills",
  authMiddleware,
  cvSkillController.getCvSkills
);

/**
 * @swagger
 * /api/cvs/{id}/skills/{skillId}:
 *   delete:
 *     summary: Sterge o competenta de pe un CV
 *     description: Elimina asocierea dintre un CV si o competenta existenta.
 *     tags: [CV Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul CV-ului
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: skillId
 *         required: true
 *         description: ID-ul competentei care va fi eliminata de pe CV
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Competenta a fost eliminata cu succes de pe CV
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica acest CV
 *       404:
 *         description: CV-ul, competenta sau asocierea nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.delete(
  "/cvs/:id/skills/:skillId",
  authMiddleware,
  cvSkillController.removeSkillFromCv
);

module.exports = router;