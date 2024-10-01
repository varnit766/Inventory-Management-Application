const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({

    name : {

        type : String ,
        required : [ true , " Please add a name "]
    } ,

    email : {

        type : String , 
        required : [ true  , " Please  add a valid email address"] ,
        trim : true ,
        unique : true  ,
        match : [ /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ , " Not a valid email"]
    } ,

    password : {

        type : String ,
        required : [ true  , " Please add  a password "],
        minLength : [ 6 , " Password should not be less than 6  characters"] 
        //maxLength : [ 23 , " Password should not be more than 23  characters "]

    } , 
    
    photo  : {

        type : String ,
        required : [true , " Please add  a photo "],
        default : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.imdb.com%2Fname%2Fnm0712433%2F&psig=AOvVaw1XD0GnEObIFKeCazMJpBk6&ust=1705759213949000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCPi917bO6YMDFQAAAAAdAAAAABAD"
    },

    phone : {

        type : String ,
        default : "+91"
    } ,

    bio : {

        type : String ,
        required : true ,
        maxLength : [ 250 , " Password should not be more than 250  characters "],
        default : "bio"
    }



} , {

    timestamps : true 
})

//  Encryption and Hashing Password before saved into DB

userSchema.pre("save" , async function( next){

    if( !this.isModified("password")){

        return next();
    }  

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password , salt);
    this.password = hashedPassword ;
    next(); 
})

const User = mongoose.model( "User" , userSchema);

module.exports = User ;