const { Claim, Product, User, sequelize } = require('../models');
const { Op } = require('sequelize'); 

const createClaim = async (req, res, next) => {
    try {
        const { id } = req.params;
        const claimerId = req.user.id;

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Produsul nu a fost găsit.' });
        if (product.status !== 'available') return res.status(400).json({ message: 'Acest produs nu mai este disponibil.' });

        const claim = await Claim.create({
            productId: id,
            claimerId: claimerId,
            status: 'pending'
        });

        res.status(201).json(claim);
    } catch (error) { next(error); }
};

const getClaims = async (req, res, next) => {
    try {
        const { as } = req.query;
        const userId = req.user.id;

        let claims;
        if (as === 'claimer') {
            claims = await Claim.findAll({
                where: { claimerId: userId },
                include: [{ model: Product, include: [{ model: User, attributes: ['phone'] }] }]
            });
        } else if (as === 'owner') {
            claims = await Claim.findAll({
                include: [
                    { model: Product, where: { ownerId: userId } },
                    { model: User, attributes: ['id', 'username', 'email', 'phone'] }
                ]
            });
        } else {
            return res.status(400).json({ message: 'Parametrul "as" trebuie să fie "claimer" sau "owner".' });
        }
        res.status(200).json(claims);
    } catch (error) { next(error); }
};

const updateClaimStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Includem produsul pentru a verifica proprietarul
        const claim = await Claim.findByPk(id, { include: Product });
        if (!claim) return res.status(404).json({ message: 'Cererea nu există.' });
        if (claim.Product.ownerId !== req.user.id) return res.status(403).json({ message: 'Acces interzis.' });

        if (status === 'approved') {
            const product = await Product.findByPk(claim.productId);
            if (product.status !== 'available') return res.status(400).json({ message: 'Produsul a fost deja dat altcuiva.' });

            // 1. Marcăm produsul ca revendicat
            product.status = 'claimed';
            await product.save();

            // 2. Respingem AUTOMAT toate celelalte cereri "pending" pentru acest produs
            await Claim.update(
                { status: 'rejected' },
                { 
                    where: { 
                        productId: claim.productId, 
                        id: { [Op.ne]: id }, // Folosim Op.ne corect acum
                        status: 'pending' 
                    } 
                }
            );
        }

        // 3. Actualizăm cererea curentă (fie approved, fie rejected)
        claim.status = status;
        await claim.save();

        res.status(200).json({ message: "Status actualizat!", claim });
    } catch (error) { 
        console.error(error);
        next(error); 
    }
};

const getClaimsForProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product || product.ownerId !== req.user.id) return res.status(403).json({ message: 'Acces interzis.' });

        const claims = await Claim.findAll({
            where: { productId: id },
            include: [{ model: User, attributes: ['id', 'username', 'email', 'phone', 'bio'] }]
        });
        res.status(200).json(claims);
    } catch (error) { next(error); }
};

module.exports = { createClaim, getClaims, getClaimsForProduct, updateClaimStatus };