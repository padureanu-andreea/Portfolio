const express = require("express");
const router = express.Router();
const debugGroupsController = require("../controllers/debugGroupsController");

//ALL ROUTES START WITH http://localhost:3000

//these endpoints are for testing the Group table in the db

router
    .get("/groups", debugGroupsController.getAllGroups)  // GET /debug/groups -> view all groups from the table
    .post("/groups", debugGroupsController.postGroup) //POST /debug/groups -> create a group
    .patch("/groups/:id", debugGroupsController.changeGroupName) // PATCH /debug/groups/:id -> edit the group with the specified id 
    .patch("/groups/:id/owner",debugGroupsController.changeGroupOwner) //PATCH /debug/groups/:id/owner -> change the owner of the specified group
    .delete("/groups/:id", debugGroupsController.deleteGroup); // DELETE /debug/groups/:id -> delete the specified group

module.exports = router;
