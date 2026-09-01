const { Op } = require("sequelize")


const Group = require("../models/group")
const GroupMember = require("../models/groupMember")
const User = require("../models/user")
const Tag = require("../models/tag");
const GroupMemberTag = require("../models/groupMemberTag");

// GET /groups/
/*
 * Retrieves all groups associated with the current user.
 * * This function fetches and categorizes groups into two lists: 
 * 1. 'owner': Groups created and owned by the user.
 * 2. 'member': Groups where the user is a participant but not the owner.
 */
const getAllMyGroups = async (req, res, next) => {
    try {
        const myGroups = [];

        // 1. Definim un format comun de "include" pentru a lua membrii și etichetele lor din grupul respectiv
        const includeMembersAndTags = {
            model: User,
            attributes: ['id', 'username'],
            through: { attributes: [] }, // Ascundem datele din tabelul pivot GroupMember
            include: [{
                model: GroupMemberTag,
                required: false,
                include: [Tag] // Luăm numele etichetei (ex: "Vegetarian")
            }]
        };

        // 2. Căutăm grupurile unde sunt PROPRIETAR
        const ownerGroupsRaw = await Group.findAll({
            where: { ownerId: req.user.id },
            include: [includeMembersAndTags]
        });

        // 3. Căutăm grupurile unde sunt MEMBRU (dar nu proprietar)
        const memberGroupsRaw = await Group.findAll({
            where: { ownerId: { [Op.ne]: req.user.id } },
            include: [
                {
                    model: GroupMember,
                    where: { userId: req.user.id },
                    required: true,
                    attributes: []
                },
                includeMembersAndTags
            ]
        });

        // 4. Funcție utilitară pentru a formata datele exact cum le cere frontend-ul tău (m.username, t.tagName)
        const formatGroup = (group) => ({
            id: group.id,
            name: group.name,
            members: group.Users.map(u => ({
                id: u.id,
                username: u.username,
                // Filtrăm etichetele pentru a le vedea doar pe cele din ACEST grup
                tags: u.GroupMemberTags
                    ?.filter(gmt => gmt.groupId === group.id)
                    .map(gmt => ({
                        tagId: gmt.Tag.id,
                        tagName: gmt.Tag.name
                    })) || []
            }))
        });

        if (ownerGroupsRaw.length > 0) {
            myGroups.push({
                status: "owner",
                groups: ownerGroupsRaw.map(formatGroup)
            });
        }

        if (memberGroupsRaw.length > 0) {
            myGroups.push({
                status: "member",
                groups: memberGroupsRaw.map(formatGroup)
            });
        }

        return res.json(myGroups);

    } catch (error) {
        next(error);
    }
};

// POST /groups/
/*
 * Creates a new group.
 * * This function initializes a new group with the provided name. 
 * It automatically assigns the authenticated user as the group's owner 
 * and immediately adds them as the first member of the group.
 */
const createGroup = async (req, res, next) => {
    try {
        const name = req.body.name
        const ownerId = req.user.id

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required" })
        }

        const groupCreated = await Group.create({
            name: name,
            ownerId: ownerId
        })

        if (!groupCreated)
            return res.status(400).json({ message: "Group failed to create!" })

        await GroupMember.create({
            groupId: groupCreated.id,
            userId: ownerId
        })

        return res.status(201).json({ message: "Group craeted successfully!" })

    } catch (error) {
        next(error)
    }
}

// GET /groups/:id
/*
 * Retrieves detailed information about a specific group.
 * * This function fetches the group's metadata (id, name, owner). 
 * It acts as a security gate, ensuring that only the owner or existing members 
 * of the group are allowed to view these details.
 */
const viewGroupDetails = async (req, res, next) => {

    //details = owner name and name of the group

    try {
        const groupId = Number(req.params.id)
        const group = await Group.findByPk(groupId)


        if (!group)
            return res.status(404).json({ message: "Group not found!" })

        if (group.ownerId !== req.user.id) {
            const isMember = await GroupMember.findOne({
                where: {
                    groupId: groupId,
                    userId: req.user.id
                }
            })

            if (!isMember) {
                return res.status(403).json({ message: "Access denied!" })
            }
        }

        const owner = await User.findByPk(group.ownerId, {
            attributes: ["id", "username"]
        })

        return res.json({
            id: group.id,
            name: group.name,
            owner: owner
        })

    } catch (error) {
        next(error)
    }

}

// PATCH /groups/:id
/*
 * Updates the name of a specific group.
 * * This function allows for the renaming of a group. 
 * Strict authorization is applied to ensure that only the creator/owner 
 * of the group has the permission to perform this update.
 */
const updateGroupName = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const { name } = req.body
        const userId = req.user.id

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required" })
        }

        const group = await Group.findByPk(groupId)

        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        // only the owner can change the name
        if (group.ownerId !== userId) {
            return res.status(403).json({ message: "Only the owner can update the group" })
        }

        group.name = name.trim()
        await group.save()

        return res.json({
            message: "Group name updated successfully",
            group: {
                id: group.id,
                name: group.name
            }
        })

    } catch (error) {
        next(error)
    }
}

// DELETE /groups/:id
/*
 * Permanently deletes a group.
 * * This function handles the removal of a group from the system. 
 * It performs a cleanup by first removing all member associations (GroupMember) 
 * before deleting the group record itself. Only the owner can execute this action.
 */
const deleteGroup = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const userId = req.user.id

        const group = await Group.findByPk(groupId)
        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        if (group.ownerId !== userId) {
            return res.status(403).json({
                message: "Only the owner can delete this group"
            })
        }

        // first, we delete all members from the GroupMembers table
        await GroupMember.destroy({
            where: { groupId: groupId }
        })

        // then, we can safely remove this group
        await Group.destroy({
            where: { id: groupId }
        })

        return res.status(200).json({
            message: "Group deleted successfully"
        })

    } catch (error) {
        next(error)
    }
}

// DELETE /groups/:id/members
/*
 * Allows a user to leave a group.
 * * This function removes the current user from the member list of a specific group. 
 * It contains logic to prevent the 'owner' from leaving their own group; 
 * owners must delete the group instead of leaving it.
 */
const leaveGroup = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const userId = req.user.id

        const group = await Group.findByPk(groupId)
        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        // owner can not leave the group before he deletes it
        if (group.ownerId === userId) {
            return res.status(403).json({
                message: "Owner cannot leave the group. Delete the group."
            })
        }

        const deleted = await GroupMember.destroy({
            where: {
                groupId: groupId,
                userId:userId
            }
        })

        if (deleted === 0) {
            return res.status(404).json({ message: "You are not a member of this group" })
        }

        return res.status(200).json({
            message: "You left the group successfully"
        })

    } catch (error) {
        next(error)
    }
}


// GET /groups/:id/members
/*
 * Retrieves a list of all members in a group.
 * * This function fetches the list of users who are part of the specified group. 
 * It includes user details (username, email) and ensures that the requestor 
 * is actually part of the group (or the owner) before releasing the data.
 */
const getMembersFromGroup = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const userId = req.user.id

        const group = await Group.findByPk(groupId)
        if (!group)
            return res.status(404).json({ message: "Group not found" })

        //check user status
        if (group.ownerId !== userId) {
            const isMember = await GroupMember.findOne({
                where: { groupId: groupId, userId: userId }
            });
            if (!isMember)
                return res.status(403).json({ message: "Access denied" })
        }

        //search for members
        const members = await GroupMember.findAll({
            where: { groupId: groupId },
            include: [
                {
                    model: User,
                    attributes: ["id", "username", "email"],
                    // includ etichetele asociate userului in acest grup
                    include: [
                        {
                            model: GroupMemberTag,
                            required: false,
                            where: { groupId: groupId }, 
                            include: [Tag] 
                        }
                    ]
                }
            ]
        });

        const formattedMembers = members.map(m => {
            const tags = m.User.GroupMemberTags ? m.User.GroupMemberTags.map(gmt => ({
                tagId: gmt.Tag.id,
                tagName: gmt.Tag.name
            })) : [];

            return {
                id: m.User.id,
                username: m.User.username,
                email: m.User.email,
                tags: tags
            };
        });

        return res.json({
            groupId,
            members: formattedMembers
        });

    } catch (error) {
        next(error)
    }
}

// POST /groups/:id/members
/*
 * Adds a new member to the group.
 * * This function allows the group owner to add another user to the group by their User ID. 
 * It performs checks to ensure the user exists and isn't already a member. 
 * Only the group owner is permitted to perform this action.
 */
const addMemberInGroup = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const ownerId = req.user.id
        const { userId } = req.body

        if (!userId)
            return res.status(400).json({ message: "userId is required" })

        const group = await Group.findByPk(groupId)
        if (!group)
            return res.status(404).json({ message: "Group not found" })

        if (group.ownerId !== ownerId)
            return res.status(403).json({ message: "Only owner can add members" })

        const user = await User.findByPk(userId)
        if (!user)
            return res.status(404).json({ message: "User not found" })

        const alreadyMember = await GroupMember.findOne({
            where: { groupId: groupId, 
                userId: userId }
        })

        if (alreadyMember)
            return res.status(409).json({ message: "User already in group" })

        await GroupMember.create({ 
            groupId: groupId, 
            userId:userId })

        return res.status(201).json({
            message: "Member added successfully",
            member: {
                id: user.id,
                username: user.username
            }
        })

    } catch (error) {
        next(error)
    }
}

const addTagToMember = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id);
        const memberId = Number(req.params.memberId);
        const { tagId } = req.body;
        const currentUserId = req.user.id; 

        const group = await Group.findByPk(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        // Doar owner-ul grupului poate pune etichete 
        if (group.ownerId !== currentUserId) {
            return res.status(403).json({ message: "Only the group owner can assign tags" });
        }

        // Verific daca userul pe care vrem sa il etichetam e in grup
        const isMember = await GroupMember.findOne({ where: { groupId, userId: memberId } });
        if (!isMember) return res.status(404).json({ message: "User is not in this group" });

        // Verific daca tag-ul exista
        const tag = await Tag.findByPk(tagId);
        if (!tag) return res.status(404).json({ message: "Tag not found" });

        // Verific daca are deja eticheta respectiva
        const existing = await GroupMemberTag.findOne({
            where: { groupId, memberId, tagId }
        });
        if (existing) return res.status(409).json({ message: "Member already has this tag" });

        await GroupMemberTag.create({
            groupId,
            memberId,
            tagId,
            createdBy: currentUserId
        });

        return res.status(201).json({ message: "Tag added to member" });

    } catch (error) {
        next(error);
    }
};

const removeTagFromMember = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id);
        const memberId = Number(req.params.memberId);
        const tagId = Number(req.params.tagId);
        const currentUserId = req.user.id;

        const group = await Group.findByPk(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.ownerId !== currentUserId) {
            return res.status(403).json({ message: "Only owner can remove tags" });
        }

        const deleted = await GroupMemberTag.destroy({
            where: { groupId, memberId, tagId }
        });

        if (deleted === 0) {
            return res.status(404).json({ message: "Tag not found on this member" });
        }

        return res.status(200).json({ message: "Tag removed successfully" });

    } catch (error) {
        next(error);
    }
};

// NU UITA sa le pui la module.exports jos de tot!
// module.exports = { ..., addTagToMember, removeTagFromMember }

//rute generale


module.exports = { getAllMyGroups, createGroup, viewGroupDetails, updateGroupName, deleteGroup, leaveGroup, getMembersFromGroup , addMemberInGroup, addTagToMember, removeTagFromMember }
