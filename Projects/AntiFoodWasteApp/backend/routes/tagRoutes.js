const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require("../middleware/authMiddleware");

router.get('/', authMiddleware, tagController.getAllTags);  //GET /tags/ for logged user -> view all tags existing in db so he can check existing tags name
router.post('/', authMiddleware, tagController.createTag); // POST /tags/  for logged user -> create a tag (if its not already in the db)

module.exports = router;