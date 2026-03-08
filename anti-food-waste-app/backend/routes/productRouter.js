const express = require("express")
const router = express.Router()

const productController = require("../controllers/productController")
const authMiddleware = require("../middleware/authMiddleware")

//ALL ROUTES START WITH http://localhost:3000

router.post("/:id/share",authMiddleware,productController.postProductToGroup) // POST /products/:id/share for logged user -> share the specified product with a group 
router.get("/:id/visibility", authMiddleware, productController.viewGroupsForProduct) // GET /products/:id/visibility for logged user -> view for the specified product all the groups in which this product is shared 
router.delete("/:id/visibility/:groupId", authMiddleware, productController.deleteProductfromGroup) // DELETE /products/:id/visibility/:groupId -> remove the specified product from the specified group 

module.exports = router