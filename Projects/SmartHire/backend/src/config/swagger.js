const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const routesPath = path
  .resolve(__dirname, "../routes/*.js")
  .replace(/\\/g, "/");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SmartHire API",
      version: "1.0.0",
      description: "Documentatie API pentru aplicatia SmartHire"
    },
    servers: [
      {
        url: "http://localhost:5000"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [routesPath]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
