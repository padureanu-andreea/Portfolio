const Product = require("../models/product")
const ProductVisibility = require("../models/productVisibility")
const Group = require("../models/group")
const { Op } = require("sequelize")

// POST /products/:id/share
/*
 * Shares a product with one or more groups.
 * * This function manages the visibility of a product. It verifies that the user owns the product, 
 * then updates the sharing settings. Note that this implementation overwrites existing shares: 
 * it first removes all current visibility records for the product and then creates new ones 
 * based on the provided 'groupIds' array.
 */
const postProductToGroup = async (req, res, next) => {
    try {
        const productId = Number(req.params.id)
        const { groupIds } = req.body

        if (!Array.isArray(groupIds) || groupIds.length === 0)
            return res.status(400).json({ message: "Select groups to share this product" })

        // const product = await Product.findByPk(productId)
        const product = await Product.findOne({
            where: {
                id: productId,
                ownerId: req.user.id
            }
        })

        if (product) {

            await ProductVisibility.destroy({ where: { productId } });

            await ProductVisibility.bulkCreate(
                groupIds.map((groupId) => ({ productId, groupId })),
                { validate: true }
            );

            return res.status(200).json({
                message: "Product shared!",
                productId,
                visibleToGroups: groupIds
            });
        }
        else
            return res.status(404).json({ message: "Product not found!" })
    }
    catch (error) {
        next(error)
    }
}

// GET /products/:id/visibility
/*
 * Retrieves the list of groups a product is shared with.
 * * This function allows the product owner to see exactly which groups have access 
 * to a specific product. It checks for product ownership, fetches the visibility records, 
 * and then retrieves the names of the associated groups.
 */
const viewGroupsForProduct = async (req, res, next) => {
    try {
        const productId = Number(req.params.id)
        const product = await Product.findOne({
            where: {
                id: productId,
                ownerId: req.user.id
            }
        })

        if (product) {
            const groupsForProduct = await ProductVisibility.findAll({
                where: { productId: productId },
                attributes: "groupId"
            }
            )
            if (groupsForProduct.length === 0)
                return res.status(404).json({ message: "Product is not available for any groups!" })

            const groupsIds = groupsForProduct.map(g => g.groupId) //voi avea [id1,id2,...]
            const groupIdName = []

            for (let id of groupsIds) {
                const group = await Group.findByPk(id)
                if (!group)
                    return res.status(404).json({ message: "Group not found" })
                groupIdName.push({
                    groupId: id,
                    groupName: group.name
                })
            }


            return res.json({
                productId: productId,
                groups: groupIdName
            })

        }
        else
            return res.status(404).json({ message: "Product not found!" })


    } catch (error) {
        next(error)
    }

}

// DELETE /products/:id/visibility/:groupId
/*
 * Removes a product's visibility from a specific group.
 * * This function revokes access to a product for a specific group. 
 * It ensures the request comes from the product owner and that the product 
 * was indeed shared with that group before attempting to delete the visibility record.
 */
const deleteProductfromGroup = async (req, res, next) => {

    try {
        const productId = Number(req.params.id)
        const groupId = Number(req.params.groupId)
        const product = await Product.findOne({
            where: {
                id: productId,
                ownerId: req.user.id
            }
        })

        if (!product)
            return res.status(404).json({ message: "Product not found!" })


        const groupsForProduct = await ProductVisibility.findAll({
            where: { productId: productId },
            include: [
                {
                    model: Group,
                    attributes: ["id", "name"]
                }
            ]
        })

        if (groupsForProduct.length === 0)
            return res.status(404).json({ message: "Product not found for any groups!" })

        const groupToDelete = await ProductVisibility.destroy({
            where: {
                productId: productId,
                groupId: groupId
            }
        })

        if (groupToDelete === 0)
            return res.status(404).json({message: "Product is not shared with this group!"});


        return res.status(200).json({message: `Product ${productId} removed from group ${groupId} successfully!`});

    } catch (error) {
        next(error)
    }
}


module.exports = { postProductToGroup, viewGroupsForProduct, deleteProductfromGroup }