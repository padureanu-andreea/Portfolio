const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const claimController = require('../controllers/claimController');
const authMiddleware =  require("../middleware/authMiddleware")

//ALL ROUTES START WITH http://localhost:3000

router.post('/',authMiddleware,  inventoryController.createProduct);  // POST /inventory/ for logged user -> create a product which is not yet shared with any groups
router.get('/',authMiddleware, inventoryController.getAllProducts); // GET /inventory/ for logged user -> get the list with all his created products
router.get('/:id',authMiddleware, inventoryController.getProductById); // GET /inventory/:id for logged user -> view the specified product 
router.patch('/:id',authMiddleware,inventoryController.updateProduct); // PATCH /inventory/:id for logged user -> update the specified product 
router.delete('/:id',authMiddleware,inventoryController.deleteProduct); // DELETE /inventory/:id for logged user -> delete the specified product 

router.post('/:id/claims',authMiddleware,claimController.createClaim); // POST /inventory/:id/claims for logged user -> create a request for the specified product 
router.get('/:id/claims',authMiddleware,claimController.getClaimsForProduct); // GET /inventory/:id/claims for looged user -> view all the other requests for the specified product

module.exports = router;