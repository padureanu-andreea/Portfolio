import fs from 'fs';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerConfig from './config/swagger.js'; // calea către fișierul tău de config Swagger

const swaggerSpec = swaggerJSDoc(swaggerConfig);

fs.writeFileSync('swagger.json', JSON.stringify(swaggerSpec, null, 2));

console.log('Swagger JSON exportat în swagger.json');