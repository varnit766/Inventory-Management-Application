const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler( async( req , res , next )=>{

   try {

    const token = req.cookies.token ;

    if( !token )          // token not exists
    {
        res.status(401);
        throw new Error("Unauthenticated User , Please Login");
    }

    const verifiedUser = jwt.verify(token , process.env.JWT_SECRETkey);      // verifying user by its token alloted

    const user = await User.findById(verifiedUser.id).select("-password");     

    if( !user ){

        res.status(401);
        throw new Error("User not found ");
        
    }

    req.user = user ;
    next();

    
   } catch (error) {

    res.status(401);
    throw new Error("Unauthorized user , Please Login");
    
   }
})

module.exports = protect ;