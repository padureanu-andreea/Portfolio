const { Op } = require("sequelize");
const Product = require("../models/product");
const ProductVisibility = require("../models/productVisibility");
const Group = require("../models/group");
const GroupMember = require("../models/groupMember");
const User = require("../models/user");

// GET /feed/products
const getProductsForMe = async (req, res, next) => {
    try {
        const { ownerId, category, expiryBefore, expiryAfter, status } = req.query;

        // Inițializăm filtrele de bază pentru Feed
        const filterList = {
            status: status || 'available', // Implicit arătăm doar ce este disponibil
            ownerId: { [Op.ne]: req.user.id } // Excludem propriile produse din feed-ul de prieteni
        };

        // Dacă utilizatorul a cerut un anumit owner (ex: dintr-un grup specific)
        if (ownerId) {
            filterList.ownerId = ownerId;
        }

        // Filtrare după data de expirare
        if (expiryBefore || expiryAfter) {
            filterList.expiryDate = {};
            if (expiryBefore) {
                filterList.expiryDate[Op.lte] = expiryBefore;
            }
            if (expiryAfter) {
                filterList.expiryDate[Op.gte] = expiryAfter;
            }
        }

        // Filtrare după categorii multiple
        if (category) {
            const categories = category.split(",").map(c => c.trim());
            filterList.category = { [Op.in]: categories };
        }

        const products = await Product.findAll({
            where: filterList, // Acum filterList conține status: 'available'
            include: [
                {
                    model: User,
                    attributes: ['username']
                },
                {
                    model: ProductVisibility,
                    required: true, 
                    include: [
                        {
                            model: Group,
                            required: true,
                            include: [
                                {
                                    model: GroupMember,
                                    required: true,
                                    where: { userId: req.user.id } 
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [["expiryDate", "ASC"]]
        });

        return res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};

module.exports = { getProductsForMe };