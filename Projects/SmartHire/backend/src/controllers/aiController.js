const openaiService = require("../services/openaiService");

const testAiAnalysis = async (req, res) => {
  try {
    const { jobDescription, cvText, candidateProfile } = req.body;

    const analysis = await openaiService.analyzeCvForJob({
      jobDescription,
      cvText,
      candidateProfile
    });

    res.json({
      message: "Analiza AI realizata cu succes",
      analysis
    });
  } catch (err) {
    console.error("AI ANALYSIS ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  testAiAnalysis
};