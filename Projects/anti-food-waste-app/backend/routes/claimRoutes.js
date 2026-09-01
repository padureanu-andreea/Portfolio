const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const authMiddleware = require("../middleware/authMiddleware")

//ALL ROUTES START WITH http://localhost:3000

// GET /claims -> for the logged user to view all the claims for his products 
router.get('/',authMiddleware, claimController.getClaims);

// PATCH /claims/:id -> accept/decline a claim for a product ( id from req.params = claim id )
router.patch('/:id',authMiddleware, claimController.updateClaimStatus);

module.exports = router;