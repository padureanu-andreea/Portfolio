const express = require("express")
const router = express.Router()

const groupController = require("../controllers/groupController")
const authMiddleware = require("../middleware/authMiddleware")

//ALL ROUTES START WITH http://localhost:3000

router.get("/", authMiddleware ,groupController.getAllMyGroups) // GET /groups/ for logged user -> view all his groups, both where his status is owner and where his status is member
    .post("/", authMiddleware, groupController.createGroup) // POST /groups/ for logged user -> create a group for which he's the owner and also update the GroupMembers table -> he is also a member

router.get("/:id", authMiddleware, groupController.viewGroupDetails)  // GET /groups/:id for logged user -> view the details ( owner and name of the group) for the specified group
    .patch("/:id", authMiddleware , groupController.updateGroupName) // PATCH /groups/:id for logged user -> if the user is the owner he can change the name of the specified group
    .delete("/:id", authMiddleware , groupController.deleteGroup) // DELETE /groups/:id -> for logged user -> if the user is the owner he can delete the group (and remove members from GroupMembers table)

router.get("/:id/members", authMiddleware , groupController.getMembersFromGroup) // GET /groups/:id/members for logged user -> view all members of the specified group  
    .post("/:id/members", authMiddleware , groupController.addMemberInGroup) // POST /groups/:id/members for logged user -> if the user is the owner he can add another user in the specified group

router.delete("/:id/members/me",authMiddleware , groupController.leaveGroup) // DELETE /groups/:id/members -> the logged user wants to leave the group 

router.post("/:id/members/:memberId/tags", authMiddleware, groupController.addTagToMember);  // POST /groups/:id/members/:memberId/tags for logged user -> create a tag for the specified member of the specified group 
router.delete("/:id/members/:memberId/tags/:tagId", authMiddleware, groupController.removeTagFromMember); // POST /groups/:id/members/:memberId/tags/:tagId for logged user -> remove the specified tag from the specified member of the specified group 

module.exports  = router