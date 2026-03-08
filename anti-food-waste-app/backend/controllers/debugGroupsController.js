const { Op } = require("sequelize")

const Group = require("../models/group")

// GET /debug/groups
const getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.findAll()
    return res.json(groups)
  } catch (error) {
    next(error)
  }
}

//POST /debug/groups
const postGroup = async (req, res, next) => {
  try {
    const { name, ownerId } = req.body

    if (!name || !ownerId) {
      return res.status(400).json({ message: "Name and ownerId are required" })
    }

    const group = await Group.create({ name: name.trim(), ownerId })
    return res.status(201).json(group)
  } catch (error) {
    next(error)
  }
}

// PATCH /debug/groups/:id 
const changeGroupName = async (req, res, next) => {
  try {
    const groupId = Number(req.params.id)
    const { name } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "name is required" })
    }

    const group = await Group.findByPk(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    group.name = name.trim()
    await group.save()

    return res.json(group)
  } catch (error) {
    next(error)
  }
}

//PATCH /debug/groups/:id/owner
const changeGroupOwner = async (req, res, next) => {
  try {
    const groupId = Number(req.params.id)
    const { ownerId } = req.body

    if (!ownerId) {
      return res.status(400).json({ message: "OwnerId is required" })
    }

    const group = await Group.findByPk(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    const newOwner = await User.findByPk(ownerId)
    if (!newOwner) {
      return res.status(404).json({ message: "New owner user not found" })
    }

    group.ownerId = ownerId
    await group.save()

    return res.json({
      message: "Group owner updated successfully",
      group: {
        id: group.id,
        name: group.name,
        ownerId: group.ownerId
      }
    })

  } catch (error) {
    next(error)
  }
}

// DELETE /debug/groups/:id
const deleteGroup = async (req, res, next) => {
  try {
    const groupId = Number(req.params.id)

    const group = await Group.findByPk(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    //mai inati se sterg membrii
    await GroupMember.destroy({ where: { groupId } })

    await Group.destroy({ where: { id: groupId } })

    return res.json({ message: "Group deleted", groupId })
  } catch (error) {
    next(error)
  }
}

module.exports ={ deleteGroup , changeGroupName , changeGroupOwner , postGroup , getAllGroups}

