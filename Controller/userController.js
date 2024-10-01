const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token= require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


const generateToken = (id)=>{

    return jwt.sign({id} , process.env.JWT_SECRETkey , { expiresIn : "1d"});
}


   //  REGISTER USER

const registerUser =  asyncHandler( async( req, res) =>{

    const{ name , email , password } = req.body ;

    // Validation

    if( !name || !email || !password){

        res.status(400);
        throw new Error("Please fill all the required fields");
    }

    if( password.length <  6 ){
        
        res.status(400);
        throw new Error(" Password is too short ");
    }

    // Check if user already exists

    const userExists = await User.findOne({email});

    if( userExists ){

        res.status(400);
        throw new Error(" Email already exists");
    }

    // Create user

    const user = await User.create({
        name , 
        email,
        password ,
    })

    //  Generate token
    const token = generateToken(user._id);

    // Send HTTP-only-cookie

    res.cookie("token" , token , {

        httpOnly : true ,
        path : '/' ,
        expires : new Date( Date.now() + 1000 * 86400) ,// 1 day
        sameSite : 'none',
        secure : true 

    })

    if( user ){

        const{ _id , name , email  , photo , phone , bio  } = user ;

        res.status(201).json({
            _id , name , email  , photo , phone , bio , token
        });      
    }

    else{
        res.status(400);
        throw new Error(" Invalid user data");
    }
});

//  LOGIN USER 

const loginUser = asyncHandler( async( req , res)=>{

    const{ email , password } = req.body ;

    if( !email || !password ){

        res.status(400);
        throw new Error("Please add email or password");
    }

    // Check if user exists or not

    const user = await User.findOne({ email}); 

    if( !user ){

        res.status(400);
        throw new Error("User not found , Please SignUp");
    }

    // Checking Password

    const passwordIsCorrect = await bcrypt.compare( password , user.password);

    // Token

    const token = generateToken(user._id);

    // Send HTTP-only-cookie

    res.cookie("token" , token , {

        httpOnly : true ,
        path : '/' ,
        expires : new Date( Date.now() + 1000 * 86400) ,// 1 day
        sameSite : 'none',
        secure : true 

    })

    if( user && passwordIsCorrect){

        const{ _id , name , email  , photo , phone , bio  } = user ;

        res.status(201).json({
            _id , name , email  , photo , phone , bio , token
        });  
    }

    else{
        res.status(400);
        throw new Error("Invalid Credintials ");
    }
})

// LOGOUT USER 

const logoutUser = asyncHandler( async( req , res )=>{

    res.cookie("token" , "" , {

        httpOnly : true ,
        path : '/' ,
        expires : new Date(0) , //  expiring the cookie 
        sameSite : 'none',
        secure : true 

    })

    res.status(200).json({ message : " Successfully LogOut"});
})

//  GET USER DATA 

const getUserData = asyncHandler( async( req , res )=>{

    const user =  await User.findById( req.user._id);

    if(!user){

        res.status(400);
        throw new Error("User not found ");
    }

    else{
        const{ _id , name , email  , photo , phone , bio  } = user ;

        res.status(201).json({
            _id , name , email  , photo , phone , bio 
        }); 
    } 
})

//  LOGIN STATUS

const loginStatus = asyncHandler( async( req , res  )=>{
 
     const token = req.cookies.token ;
 
     if( !token )          // token not exists
     {
         res.json(false)
     }
 
     const verifiedUser = jwt.verify(token , process.env.JWT_SECRETkey);      // verifying user by its token alloted
 
    if( verifiedUser ){

        res.json(true);
    }

    res.json(false) ;
       
})

// UPDATE USER DETAILS

const updateUser = asyncHandler( async( req , res )=>{

    const user = await User.findById(req.user._id);

    if( !user ){

        res.status(400);
        throw new Error(" User not found ");
    }

    const{ _id ,name ,  email , phone , photo  , bio } = user 

    user.email = email ,
    user.name = req.body.name || name ,
    user.phone = req.body.phone || phone ,
    user.photo = req.body.photo || photo ,
    user.bio = req.body.bio || bio 

    await user.save();

    res.status(201).json({
    
        _id : user.id,
        name : user.name,
        email : user.email,
        phone : user.phone,
        photo: user.photo,
        bio: user.bio,

    }) 

   /* const updateUserDetail = await user.save();

    res.status(201).json({
    
        _id : updateUserDetail.id,
        name : updateUserDetail.name,
        email : updateUserDetail.email,
        phone : updateUserDetail.phone,
        photo: updateUserDetail.photo,
        bio: updateUserDetail.bio,

    })   */
})

// CHANGE PASSWORD

const changePassword = asyncHandler( async( req , res )=>{

    const user = await User.findById(req.user._id);

    if( !user ){

        res.status(400);
        throw new Error(" User not found ");
    }

    const{ oldPassword , password } = req.body ;

    // Validate

    if( !oldPassword || !password ){

        res.status(400);
        throw new Error("Pleases enter oldPassword and newPassword");

    }

    // Checking OldPassword

    const oldPasswordCorrect = await bcrypt.compare(oldPassword , user.password);

    // Save new Password
    
    if( oldPasswordCorrect){

        user.password = password ;
        await user.save();
        res.status(400).send(" Password changed Successfully");
    }

    else{

        res.status(400);
        throw new Error("oldPassword is Incorrect");

    }
})

// FORGOT PASSWORD
 
const forgotPassword = asyncHandler( async( req , res)=>{

    const{email} = req.body ;

    const user = await User.findOne({email}) ;

    //  User Exists or Not
    if( !user){

        res.status(404);
        throw new Error(" User does not Exists");
    }

    // Delete Token if already exists in DB  because have to generate new token for new rqst

    let token = await Token.findOne({userId : user._id});
    
    if( token ){

        await token.deleteOne() ;
    }

    // Create fresh Reset Token 
     
    const resetToken = crypto.randomBytes(32).toString("hex") + user._id ;

    // Hashed the token before saving to DB

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save token to DB

    await new Token({

        userId : user._id ,
        token : hashedToken , 
        createdAt : Date.now(),
        expiresAt : Date.now() + 30 * 60 * 1000 ,

    }).save();

    //  Construct Reset_url

    const reset_url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}` ;

    // Reset email message
     
    const message  = `
    <h2> Hello ${user.name}</h2>
    <p>  Please use the below url to reset your password</p>
    <a  href = ${reset_url} clicktracking = off>${reset_url}</a> 
    
    <p> Regards.......</p>
    <p> Karan's Development Team </p>
    `;

    const subject = "Password Reset Request"
    const send_to = user.email
    const sent_from = process.env.EMAIL_USER ;

    try {

        await sendEmail( subject ,  send_to , sent_from , message );
        res.status(200).json({ success : true , message : "Reset Email Sent"});
        
    } catch (error) {

        res.status(500).json({message :" Email not Sent , Try again"})
        
    }    
});


module.exports = {registerUser , loginUser , logoutUser , getUserData , loginStatus , updateUser , changePassword , forgotPassword};