const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

const User = require("../models/user")

/*
 * Middleware to verify JSON Web Token (JWT) for protected routes.
 * * This function acts as a security gatekeeper for the application. It checks the 
 * 'Authorization' header of incoming requests for a valid Bearer token. 
 * * It decodes the token to extract the user ID, verifies that the user still exists 
 * in the database, and attaches the full user object to 'req.user'. This allows 
 * controllers to access the authenticated user's data without needing 
 * to query the database again.
 */
const verifyToken = async(req , res , next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "No token found"})
    }

    const token = authHeader.split(" ")[1]

    try{
        const decoded = jwt.verify(token,JWT_SECRET) 

        const user = await User.findByPk(decoded.userID)

        if(!user)
            return res.status(401).json({message:"Invalid token!"})

        req.user =user

        next()

    }catch(error){
        next(error)
    }
}

module.exports = verifyToken