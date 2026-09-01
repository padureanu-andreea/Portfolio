const { Product, ProductVisibility } = require('../models');
const { Op } = require('sequelize');

// POST /inventory/
/*
 * Creează un produs nou în inventar.
 * Acest produs este legat automat de utilizatorul logat (ownerId).
 */
const createProduct = async (req, res, next) => {
    try {
        const ownerId = req.user.id;
        let { name, category, quantity, expiryDate, notes } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "numele este obligatoriu" });
        }
        if (!category || !category.trim()) {
            return res.status(400).json({ message: "categoria este obligatorie" });
        }
        if (!quantity || !quantity.trim()) {
            return res.status(400).json({ message: "cantitatea este obligatorie" });
        }
        if (!expiryDate) {
            return res.status(400).json({ message: "expiryDate este obligatoriu (YYYY-MM-DD)" });
        }

        const product = await Product.create({
            ownerId,
            name: name.trim(),
            category: category.trim(),
            quantity: quantity.trim(),
            expiryDate,                
            notes: notes?.trim() || null,
            status: 'available' // Status implicit la creare
        });

        return res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        next(error);
    }
};

// GET /inventory/
/*
 * Recuperează lista de produse ale utilizatorului.
 * MODIFICARE: Filtrează implicit produsele pentru a afișa doar cele active ('available', 'claimed').
 * Produsele 'consumed' sau 'trashed' rămân în DB dar nu apar în inventarul curent.
 */
const getAllProducts = async (req, res, next) => {
    try {
        const { category, status, sort, order } = req.query;

        // Logica de filtrare pentru "Active View"
        const whereClause = {
            ownerId: req.user.id,
            status: { [Op.in]: ['available', 'claimed'] } // Filtru implicit pentru Soft Delete
        };

        if (category) {
            whereClause.category = category;
        }

        // Dacă utilizatorul cere în mod explicit un anumit status (ex: pentru statistici), suprascriem filtrul implicit
        if (status) {
            whereClause.status = status;
        }

        let orderClause = [['expiryDate', 'ASC']];

        if (sort) {
            const sortField = sort === 'expiry_date' ? 'expiryDate' :
                sort === 'created_at' ? 'createdAt' :
                    'name';
            const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
            orderClause = [[sortField, sortOrder]];
        }

        const products = await Product.findAll({
            where: whereClause,
            include: [ProductVisibility],
            order: orderClause
        });

        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

// GET /inventory/:id
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: {
                id: id,
                ownerId: req.user.id
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

// PATCH /inventory/:id
/*
 * Actualizează un produs. 
 * Folosită și pentru "Soft Delete" prin schimbarea statusului în 'consumed' sau 'trashed'.
 */
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: {
                id: id,
                ownerId: req.user.id
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.update(req.body);
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

// DELETE /inventory/:id
/*
 * Șterge DEFINITIV un produs.
 * Recomandat să fie folosită doar pentru corectarea greșelilor de introducere, 
 * nu pentru fluxul normal de consum/risipă.
 */
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: {
                id: id,
                ownerId: req.user.id
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.destroy();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};