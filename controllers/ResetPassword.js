const user = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto =require("crypto");



//resetPassword token
exports.resetPasswordToken = async(req,res)=>{
    try {

        //get email fromm req.body

        const {email} = req.body;

        const userValid = await user.findOne({email});

        if(!userValid){
            return res.status(401).json({
                success:false,
                message:"Not a valid user, Please signup"
            })
        }

        //generate token
        const token = crypto.randomUUID();

        //updating this token into the user stored in the database

        const updatedDetails = await user.findOneAndUpdate(
            {email:email},
            {
                token:token,
                resetPasswordExpires: Date.now() + 5*60*1000,
            },
            {new:true}
        );

        //creating a url for frontend
        const url = `https://localhost:3000/update-password/${token}`;


        //mail to change the password
        await mailSender(
            email, 
            "Password Reset Link",
            `Password Reset Link: ${url}`
        )

        return res.status(200).json({
            success:true,
            message:"Email sent successfully Please check"
        })
        
    } catch (error) {
        
        return res.status(500).json({
            success:true,
            message:"Email sent Error"
        })
    }
}




//reset password

exports.resetPassword = async (req,res) => {

    try {
    
    const {password, confirmPassword, token} = req.body;

    //validation
    if(password != confirmPassword){
        return res.json({
            success:false,
            message:'Password not matching'
        });
    }

    //get user details from db using token
    const userDetails = await user.findOne({token:token});

    //if no entry - invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:'Token is invalid'
        })
    };

    //token time check
    if(userDetails.resetPasswordExpires < Date.now()){
        return res.json({
            success:true,
            message:"Token is expired"
        })
    };

    //hashing the password

    const hashedPassword = await bcrypt.hash(password, 10);


    //updating the password
    await user.findOneAndUpdate(
        {token:token},
        {
            password:hashedPassword
        },
        {new:true},
    );

    return res.status(200).json({
        success:true,
        message:"password reset successfully"
    })




        
    } catch (error) {
        console.error(error);
        return res.status(200).json({
            success:true,
            message:"Error in password resetting"
        })
        
    }

    

    //
}