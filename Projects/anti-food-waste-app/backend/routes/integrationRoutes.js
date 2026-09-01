const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');

//ALL ROUTES START WITH http://localhost:3000

router.get('/share/facebook/:productId', integrationController.generateFacebookShare);  // GET /integrations/share/facebook/:productId -> pop-up with facebook "create a post" tab; log in to facebook account is required
router.get('/share/instagram/:productId', integrationController.generateInstagramContent);  // GET //integrations/instagram/:productId -> pop-up with instagram page; log in to instagram account is required

module.exports = router;