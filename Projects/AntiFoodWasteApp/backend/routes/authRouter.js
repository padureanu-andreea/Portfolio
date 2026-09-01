const express = require('express')
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")

//ALL ROUTES START WITH http://localhost:3000

//POST /auth/register -> user wants to create an account
router.post("/register",authController.createUser)

//POST /auth/login -> user wants to login -> a token is being generated for knowing which user is logged in the app
router.post("/login",authController.searchUser)

//GET /auth/me -> endpoint called from frontend to generate UI based on the received token 
router.get("/me",authMiddleware,authController.getMe)

// PATCH /auth/me for logged user -> edit fields for his account
router.patch("/me", authMiddleware, authController.editUser)

//general routes
//no need for middleware, these are the basic CRUD routes for interogation on the db


//GET /auth/users -> view all users from db
router.get("/users", authController.getAllUsers)

//GET /auth/users/:username -> view user with the specified username 
router.get("/users/:username", authController.getUserByUsername)


module.exports = router