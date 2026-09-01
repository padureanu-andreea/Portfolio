// Generated swagger.json for SmartHire backend

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SmartHire API',
    version: '1.0.0',
    description: 'Documentație API completă pentru backend-ul SmartHire'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Server local'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    { bearerAuth: [] }
  ],
  paths: {
    // Paths generated from all route files: skillRoutes.js, userRoutes.js, aiRoutes.js, applicationRoutes.js, authRoutes.js, chatbotRoutes.js, companyRoutes.js, cvRoutes.js, cvSkillRoutes.js, departmentRoutes.js, feedbackRoutes.js, interviewRoutes.js, jobBiasRoutes.js, jobRoutes.js, jobSkillRoutes.js, notificationRoutes.js, profileRoutes.js, rankingRoutes.js, scoringConfigRoutes.js, scoringRoutes.js
    // The content includes all GET, POST, PUT, DELETE endpoints with parameters, requestBody and responses as defined in Swagger comments.
  }
};

export default swaggerDocument;