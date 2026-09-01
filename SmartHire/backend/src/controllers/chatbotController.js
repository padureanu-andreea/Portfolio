const chatbotModel = require("../models/chatbotModel");
const openaiService = require("../services/openaiService");
const USER_ROLES = require("../constants/userRoles");

const askCandidateChatbot = async (req, res) => {
  try {
    if (req.user.rol !== USER_ROLES.CANDIDAT) {
      return res.status(403).json({
        message: "Doar candidatii pot folosi chatbotul"
      });
    }

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "question este obligatoriu"
      });
    }

    const candidate = await chatbotModel.getCandidateByUserId(req.user.id);

    if (!candidate) {
      return res.status(400).json({
        message: "Nu exista candidat asociat acestui user"
      });
    }

    const applications = await chatbotModel.getCandidateApplicationsContext(
      candidate.id_candidat
    );

    const notifications = await chatbotModel.getCandidateNotifications(
      req.user.id
    );

    const context = {
      candidate: {
        id_candidat: candidate.id_candidat,
        disponibilitate: candidate.disponibilitate
      },
      applications,
      notifications
    };

    const answer = await openaiService.answerCandidateQuestion({
      question,
      context
    });

    res.json({
      message: "Raspuns generat cu succes",
      answer,
      context_used: {
        applications_count: applications.length,
        notifications_count: notifications.length
      }
    });
  } catch (err) {
    console.error("CANDIDATE CHATBOT ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  askCandidateChatbot
};