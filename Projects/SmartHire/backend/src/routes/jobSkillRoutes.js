const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middlewares/authMiddleware");

const jobSkillController =
  require("../controllers/jobSkillController");

/**
 * @swagger
 * tags:
 *   name: Job Skills
 *   description: Endpointuri pentru gestionarea competentelor asociate joburilor
 */

/**
 * @swagger
 * /api/jobs/{id}/skills:
 *   post:
 *     summary: Adauga o competenta la un job
 *     description: Permite asocierea unei competente introduse manual cu un job existent. Daca aceasta nu exista in dictionarul intern de competente, este creata automat. Competenta poate fi marcata ca obligatorie sau optionala.
 *     tags: [Job Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului la care se adauga competenta
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
 *               - nume_competenta
 *             properties:
 *               nume_competenta:
 *                 type: string
 *                 example: JavaScript
 *               este_obligatoriu:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Competenta a fost adaugata cu succes la job
 *       400:
 *         description: Date invalide sau campuri obligatorii lipsa
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica acest job
 *       404:
 *         description: Jobul nu a fost gasit
 *       409:
 *         description: Competenta este deja asociata acestui job
 *       500:
 *         description: Eroare interna de server
 */
router.post(
  "/jobs/:id/skills",
  authMiddleware,
  jobSkillController.addSkillToJob
);

/**
 * @swagger
 * /api/jobs/{id}/skills:
 *   get:
 *     summary: Listeaza competentele unui job
 *     description: Returneaza competentele asociate unui job, inclusiv informatia daca fiecare competenta este obligatorie sau optionala.
 *     tags: [Job Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul jobului pentru care se listeaza competentele
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista competentelor jobului a fost returnata cu succes
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
 *                   id_competenta:
 *                     type: integer
 *                     example: 3
 *                   nume_competenta:
 *                     type: string
 *                     example: JavaScript
 *                   este_obligatoriu:
 *                     type: boolean
 *                     example: true
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a vedea competentele acestui job
 *       404:
 *         description: Jobul nu a fost gasit
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/jobs/:id/skills",
  authMiddleware,
  jobSkillController.getJobSkills
);

router.put(
  "/jobs/:id/skills/:skillId",
  authMiddleware,
  jobSkillController.updateSkillForJob
);

/**
 * @swagger
 * /api/jobs/{id}/skills/{skillId}:
 *   delete:
 *     summary: Sterge o competenta de pe un job
 *     description: Elimina asocierea dintre un job si o competenta existenta.
 *     tags: [Job Skills]
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
 *       - in: path
 *         name: skillId
 *         required: true
 *         description: ID-ul competentei care va fi eliminata de pe job
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Competenta a fost eliminata cu succes de pe job
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica acest job
 *       404:
 *         description: Jobul, competenta sau asocierea nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.delete(
  "/jobs/:id/skills/:skillId",
  authMiddleware,
  jobSkillController.removeSkillFromJob
);

module.exports = router;
