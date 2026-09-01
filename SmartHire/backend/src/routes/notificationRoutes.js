const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const notificationController = require("../controllers/notificationController");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Endpointuri pentru gestionarea notificarilor utilizatorilor
 */

/**
 * @swagger
 * /api/notifications/my:
 *   get:
 *     summary: Listeaza notificarile utilizatorului autentificat
 *     description: Returneaza notificarile primite de utilizatorul autentificat, generate automat in aplicatie pentru actiuni precum aplicatie trimisa, schimbare status, candidatura retrasa sau interviu programat.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista notificarilor a fost returnata cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_notificare:
 *                     type: integer
 *                     example: 1
 *                   id_utilizator:
 *                     type: integer
 *                     example: 4
 *                   tip:
 *                     type: string
 *                     example: Status candidatura actualizat
 *                   mesaj:
 *                     type: string
 *                     example: Candidatura ta pentru jobul Frontend Developer a fost trecuta in statusul IN_ANALIZA.
 *                   citit:
 *                     type: boolean
 *                     example: false
 *                   data_creare:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-05-26T12:00:00.000Z
 *       401:
 *         description: Token lipsa sau invalid
 *       500:
 *         description: Eroare interna de server
 */
router.get(
  "/notifications/my",
  authMiddleware,
  notificationController.getMyNotifications
);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marcheaza o notificare ca citita
 *     description: Actualizeaza statusul unei notificari si o marcheaza ca fiind citita pentru utilizatorul autentificat.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul notificarii care va fi marcata ca citita
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Notificarea a fost marcata ca citita cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a modifica aceasta notificare
 *       404:
 *         description: Notificarea nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.put(
  "/notifications/:id/read",
  authMiddleware,
  notificationController.markNotificationAsRead
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Sterge o notificare
 *     description: Sterge o notificare existenta, pe baza ID-ului primit ca parametru. Utilizatorul poate sterge doar notificarile proprii, conform regulilor din controller.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID-ul notificarii care va fi stearsa
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Notificarea a fost stearsa cu succes
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Utilizatorul nu are permisiunea de a sterge aceasta notificare
 *       404:
 *         description: Notificarea nu a fost gasita
 *       500:
 *         description: Eroare interna de server
 */
router.delete(
  "/notifications/:id",
  authMiddleware,
  notificationController.deleteNotification
);

module.exports = router;