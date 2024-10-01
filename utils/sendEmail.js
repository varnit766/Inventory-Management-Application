const nodemailer = require("nodemailer");

const sendEmail  = async( subject , send_to , sent_from , message )=>{

    // EMAIL TRANSPORTER
    const transport = nodemailer.createTransport({

        host : process.env.EMAIL_HOST ,
        port : 587 ,
        auth :{
    
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASS
        } ,

        tls :{
            rejectUnauthorized : false
        }
    });

    // OPTION FOR SENDING EMAIL
    const mailoptions = {

        from : sent_from ,
        to  : send_to ,
        subject : subject ,
        html : message 
    }

    // send email

    transport.sendMail( mailoptions , function(err , info){

        if(err)
          console.log(err);

        else{
            console.log(info);
        }  

    })
};

module.exports = sendEmail ;
