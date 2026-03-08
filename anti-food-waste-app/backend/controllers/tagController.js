const Tag = require('../models/tag');

// GET /tags 
/*
 * Retrieves a list of all available tags.
 * * This function fetches every tag stored in the database, including both default system tags 
 * and custom tags created by users. 
 */
const getAllTags = async (req, res, next) => {
    try {
        const tags = await Tag.findAll();
        return res.json(tags);
    } catch (error) {
        next(error);
    }
};

// POST /tags 
/*
 * Creates a new custom tag.
 * * This function allows users to define new tags for categorizing groups or products. 
 * It performs a check to ensure the tag name is not empty and does not already exist 
 * to prevent duplicates. New tags created via this endpoint are marked as 
 * custom (isDefault: false).
 */
const createTag = async (req, res, next) => {
    try {
        let { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Tag name is required." });
        }

        name = name.trim();

        // Check if the tag already exists
        const existingTag = await Tag.findOne({ where: { name: name } });

        if (existingTag) {
            return res.status(409).json({ message: "Tag already exists.", tag: existingTag });
        }

        // Create the new tag
        const newTag = await Tag.create({
            name: name,
            isDefault: false
        });

        return res.status(201).json(newTag);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllTags,
    createTag
};