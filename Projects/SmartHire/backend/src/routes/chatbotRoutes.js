const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const chatbotController = require("../controllers/chatbotController");

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Endpointuri pentru chatbotul candidatului
 */

/**
 * @swagger
 * /api/chatbot/candidate:
 *   post:
 *     summary: Trimite o intrebare catre chatbotul candidatului
 *     description: Permite candidatului autentificat sa adreseze intrebari chatbotului. Raspunsul este generat pe baza aplicatiilor reale ale candidatului, a notificarilor si a interviurilor programate.
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: Care este statusul candidaturilor mele?
 *     responses:
 *       200:
 *         description: Raspuns generat cu succes de chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   example: Ai o candidatura in analiza pentru postul de Frontend Developer si un interviu programat pentru data de 30 mai 2026.
 *       400:
 *         description: Mesaj lipsa sau date invalide
 *       401:
 *         description: Token lipsa sau invalid
 *       403:
 *         description: Acces permis doar candidatilor
 *       500:
 *         description: Eroare interna de server sau eroare la generarea raspunsului AI
 */
router.post(
  "/chatbot/candidate",
  authMiddleware,
  chatbotController.askCandidateChatbot
);

module.exports = router;