const { Op } = require("sequelize")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET


const User = require("../models/user")


//POST /auth/register
/*
 * Registers a new user.
 * * This function first normalizes the email address. It then checks the database to ensure
 * that neither the username nor the email is already in use. If the credentials are unique,
 * it hashes the password using bcrypt for security and creates the new user record.
 */
const createUser = async (req, res, next) => {
    try {

        let { username, email, password, phone, bio } = req.body
        email = email.toLowerCase().trim()

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === username)
                return res.status(409).json({ message: "Username already used!" })
            if (existingUser.email === email)
                return res.status(409).json({ message: "Email already used!" })
        }

        const passwordHash = await bcrypt.hash(password, 10)


        await User.create({
            username,
            email,
            passwordHash,
            phone,
            bio
        })
        return res.status(201).json({ message: "User created!" })


    }
    catch (error) {
        next(error)
    }
}


//POST /auth/login
/*
 * Authenticates a user (Login).
 * * This function handles the login process. It allows users to sign in using either 
 * their username or their email address. It retrieves the user, verifies the provided 
 * password against the stored hash, and if successful, generates a JWT token 
 * (valid for 7 days) to be used for subsequent authorized requests.
 */
const searchUser = async (req, res, next) => {
    try {

        let { username, email, password } = req.body
        email = email.toLowerCase().trim()

        const existingUser = await User.findOne({
            where: {
                email: email
            }
        });

        if (existingUser) {
            const isTheSame = await bcrypt.compare(password, existingUser.passwordHash)
            if (!isTheSame)
                return res.status(401).json({ message: "Wrong credentials!" })
            else {
                const token = jwt.sign(
                    { userID: existingUser.id },
                    JWT_SECRET,
                    { expiresIn: "7d" }
                )


                return res.json({
                    username: username,
                    email: email,
                    phone: existingUser.phone,
                    bio: existingUser.bio,
                    message: "Login success",
                    token: token
                })
            }
        }
        else {
            return res.status(404).json({ message: "No match! Create an account." })
        }


    } catch (error) {
        next(error)
    }
}

// PATCH /auth/me
/*
 * Updates the current user's profile.
 * * This function allows a logged-in user to update their allowed profile fields 
 * (username, phone, bio). It performs a validation check to ensure that if the 
 * username is being changed, the new username does not conflict with an existing one.
 */
const editUser = async (req, res, next) => {
    try {
        const user = req.user

        const allowedFileds = ["username", "phone", "bio"]

        const updates = {}

        for (const field of allowedFileds) {
            if (req.body[field] !== undefined)
                updates[field] = req.body[field]
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" })
        }

        for (const field of Object.keys(updates)) {
            if (field === "username") {
                const existingUser = await User.findOne({
                    where: {
                        username: updates[field],
                        id: { [Op.ne]: user.id }
                    }
                })

                if (existingUser)
                    return res.status(400).json({ message: "Username already used!" })
            }
        }

        await user.update(updates)

        return res.json({
            message: "Profile updated!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                bio: user.bio
            }
        })
    }
    catch (error) {
        next(error)
    }
}

//GET /auth/me
/*
 * Retrieves the current user's profile information.
 * * This function returns the details (ID, username, email, phone, bio) of the 
 * user currently authenticated by the token. It relies on the 'authMiddleware' 
 * to have already populated 'req.user'.
 */
const getMe = async (req, res, next) => {

    //preluat de la middleware
    const user = req.user


    return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio
    })
}


// ===== General Routes =====

// GET /auth/users
/*
 * Fetches a list of all users.
 * * This function retrieves all users from the database but filters the output 
 * to return only public information (id, username, email, phone, bio), 
 * strictly excluding sensitive data like password hashes.
 */
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "username", "email", "phone", "bio"] //fara parola
        });
        return res.json(users);
    } catch (error) {
        next(error);
    }
};

//GET /auth/users/:username
/*
 * Searches for a specific user by username.
 * * This function looks up a user based on the username parameter provided in the URL.
 * If found, it returns their public profile information; otherwise, it returns a 404 error.
 */
const getUserByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({
            where: { username },
            attributes: ["id", "username", "email", "phone", "bio"]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json(user);
    } catch (error) {
        next(error);
    }
};



module.exports = { createUser, searchUser, editUser, getMe, getAllUsers, getUserByUsername }
