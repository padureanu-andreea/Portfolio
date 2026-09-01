const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const cvRoutes = require("./routes/cvRoutes");
const jobSkillRoutes = require("./routes/jobSkillRoutes");
const cvSkillRoutes = require("./routes/cvSkillRoutes");
const profileRoutes = require("./routes/profileRoutes");
const scoringConfigRoutes = require("./routes/scoringConfigRoutes");
const scoringRoutes = require("./routes/scoringRoutes");
const rankingRoutes = require("./routes/rankingRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const jobBiasRoutes = require("./routes/jobBiasRoutes");
const skillRoutes = require("./routes/skillRoutes");
const companyRoutes = require("./routes/companyRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", jobRoutes);
app.use("/api", applicationRoutes);
app.use("/api", cvRoutes);
app.use("/api", jobSkillRoutes);
app.use("/api", cvSkillRoutes);
app.use("/api", profileRoutes);
app.use("/api", scoringConfigRoutes);
app.use("/api", scoringRoutes);
app.use("/api", rankingRoutes);
app.use("/api", interviewRoutes);
app.use("/api", feedbackRoutes);
app.use("/api", notificationRoutes);
app.use("/api", aiRoutes);
app.use("/api", jobBiasRoutes);
app.use("/api", skillRoutes);
app.use("/api", companyRoutes);
app.use("/api", departmentRoutes);
app.use("/api", chatbotRoutes);
app.use("/api", statisticsRoutes);

module.exports = app;
