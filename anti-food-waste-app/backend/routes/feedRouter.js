const express = require('express')
const router = express.Router()

const feedController = require("../controllers/feedController")
const authMiddleware = require("../middleware/authMiddleware")

//ALL ROUTES START WITH http://localhost:3000

// GET /feed/products -> for the loggede user to see what products are shared with him
router.get("/products", authMiddleware, feedController.getProductsForMe)

module.exports = router