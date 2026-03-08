const { Product } = require('../models');

// GET /integrations/share/facebook/:productId
/*
 * Generates a Facebook share link for a specific product.
 * * This function fetches the product details and constructs a specialized URL for the 
 * Facebook Sharer.
 */
const generateFacebookShare = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const product = await Product.findByPk(productId);
        
        if (!product) {
            return res.status(404).json({ message: "Product does not exist." });
        }

        // Verific dac produsul mai e disponibil
        if (product.status !== 'available') {
            return res.status(400).json({ message: "Only available products can be shared." });
        }

        const appLink = "http://localhost:3000"; 
        const message = `Donez ${product.name} prin aplicația AntiFoodWaste! Expiră pe ${product.expiryDate}. #AntiFoodWaste`;
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appLink)}&quote=${encodeURIComponent(message)}`;

        res.status(200).json({
            platform: 'facebook',
            productName: product.name,
            generatedMessage: message,
            shareUrl: shareUrl
        });

    } catch (error) {
        next(error); 
    }
};

// GET //integrations/instagram/:productId
/*
 * Generates formatted content for an Instagram post.
 * * This function prepares a text caption  for a specific product. 
 * Since Instagram does not support direct posting via web links in the same way Facebook does, 
 * this endpoint returns the text for the user to copy and paste manually into their Instagram app 
 * along with instructions.
 */
const generateInstagramContent = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: "Product does not exist." });
        }

        if (product.status !== 'available') {
            return res.status(400).json({ message: "Only available products can be shared." });
        }

        const message = `Donez ${product.name}! Expiră la: ${product.expiryDate}. Contactează-mă pe AntiFoodWaste App! #StopFoodWaste`;

        res.status(200).json({
            platform: 'instagram',
            productName: product.name,
            generatedMessage: message,
            // Adăugăm URL-ul către Instagram și instrucțiunea clară
            shareUrl: "https://www.instagram.com/", 
            instruction: "Instagram nu permite postarea automată. Mesajul a fost copiat! Lipsește-l în descrierea postării tale."
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateFacebookShare,
    generateInstagramContent
};