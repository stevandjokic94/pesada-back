const crypto = require('crypto');
const { errorHandler } = require('./dbErrorHandler');
const nodemailer = require('nodemailer');

exports.sendEmail = async(user, subject, text) => {

	const transporter = nodemailer.createTransport({
    host: "smtp.zoho.eu",
    secure: true,
    port: 465,
    auth: {
      user: process.env.AUTH,
      pass: process.env.PASS
    }
  });

  const mailOptions = {
    from: process.env.AUTH,
    to: user.email,
    subject,
    text 
  };
  console.log(process.env.SERVICE);
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      errorHandler(error);
      console.log(error);
    }
    else{
      console.log('Email sent: ' + info.response);
    }
    console.log(process.env.AUTH, process.env.PASS);
  });
  transporter.close();
}