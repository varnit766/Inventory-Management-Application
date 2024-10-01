const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require( "./routes/userRoute");
const errorHandler = require("./Middleware/errorMiddleware");
const cookieParser = require("cookie-parser");


const app = express();

// Middlewares

app.use( express.json());
app.use( express.urlencoded({ extended : false}));
app.use( bodyParser.json());
app.use(cookieParser());

// Routes Middlewares

 app.use( "/api/users" , userRoute);
// Routes

app.get( "/" , ( req , res) =>{

    res.send("HomePage is There"); 
})

// Error Middleware
app.use(errorHandler) ;

const PORT = process.env.PORT || 5000 ;

// Connect to DB then Start the Server
const MONGODB_url = "mongodb+srv://Karan_Bhaiyya:0IMnhGYebhaLusro@cluster0.fmf6qnq.mongodb.net/inventorydata?retryWrites=true&w=majority" ;

mongoose.connect(MONGODB_url)
.then(()=>{

    app.listen(PORT , ()=>{
        console.log("Server starting at port 5000");
    });
})
.catch((err)=> console.log(err));


