const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
        },
        otp:{
            type:String,
            required:true,

        },
        createdAt:{
            type:Date,
            default:Date.now(),
            expire:5*60,
        }

    }
);


//a function to send emails
async function sendVerificationEmail(email, otp){
    try {
        
        const mailResponse = await mailSender(email, "Verification Email from Study Notion", otp);
        console.log("Email send successfully", mailResponse);

    } catch (error) {
        console.error(error);
        console.log("Error occured while sending mail")
        
    }
}

OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
});

module.exports = mongoose.model("OTP", OTPSchema);