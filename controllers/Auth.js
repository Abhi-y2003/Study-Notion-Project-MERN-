//send otp
const user = require("../models/User");
const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require('otp-generator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.sendOtp = async(req,res) => {
    
    try {
        
         //fetching email from the req ke body
    const {email} = req.body;

    //check if the user already exist or not
    const checkUserPresent = await  User.findOne({email});

    if(checkUserPresent){
        return res.status(400).json({
            success:false,
            message:"User Already Exists"
        })
    }


    //generate Otp

    
    var otp = otpGenerator.generate(6, { 
        upperCaseAlphabets: false, 
        lowerCaseAlphabets: false, 
        specialChars: false 
    });

    console.log("otp generated:", otp);

    //check for unique otp
    let result = await OTP.findOne({otp: otp});

    while(result){
        otp = otpGenerator.generate(6, { 
            upperCaseAlphabets: false, 
            lowerCaseAlphabets: false, 
            specialChars: false 
        });

        result = await OTP.findOne({otp: otp});
    }

    //making a otp payload

    const otpPayload = {email, otp};

    //creating an entry for otp in db
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({
        success:true,
        message:"otp send successfully",
        otp,
    })


    } catch (error) {
        console.error(error);
        res.status(401).json({
            success:false,
            message:"otp send Error"
        })
    }
};


//signup

exports.singUp = async (req,res) =>{


    try {
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp }
            = req.body;
    
    
        if(!firstName || !lastname || !email || !password || !confirmPassword || !contactNumber || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }
    
        //checking 2 passwords
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password is not  same"
            })
        }
    
        const userExist = await User.findOne({email});
    
        if(userExist){
            return res.status(400).json({
                success:false,
                message:"User Already exist"
            })
        }
        
    
        //finding the most recent opt stored for login
        //.sort({createdAt: -1}): Sorts the documents in the collection by the createdAt field in descending order. 
        //.limit(1): Limits the results to one document.
        
    
        const recentOtp = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);


        //validating otp
        if(recentOtp.length == 0){
            //otp not found
            return res.status(400).json({
                success:false,
                message:"Otp not found"
            })
        }else if (otp !== recentOtp.otp){
            return res.status(400).json({
                success:false,
                message:"OTP does not match"
            })
        }


        //hashing the password

        const hashedPassword = await bcrypt.hash(password, 10);


        //create a entry in Db

        const profileDetails = await profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,

        });
        const user = await user.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebaear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        return res.status(200).json({
            success:false,
            message:"Signup successful",
            user,
        })
    

        
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            success:false,
            message:"Error in sign up form "
        })
    }
}


//login

exports.login = async (req,res) =>{

    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        };

        const userExist = await User.findOne({email});

        if(!userExist){
            return res.status(400).json({
                success:false,
                message:"Please Signup"
            })
        }

        //generate gwt token and comparing the password
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                 email:user.email,
                 id: _id,
                 accountType:user.accountType,
                }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            })

            user.token = token;
            user.password = undefined;

            //creating a cookie and sending a response
            const options = {
                expires:new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully"
            });

        }else {
            return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            })
        }

    } catch (error) {
        console.error(error);
        return res.status(401).json({
            success:false,
            message:"Login failure please try again"
        })
        
    }
}


//change password

exports.changePassword = async(req,res)=>{

    try {

        //get data from req ke body
        const {email, oldPassword, newPassword, confirmNewPassword} = req.body;

        if(newPassword !== confirmNewPassword){
            return res.status(401).json({
                success:false,
                message:"Password must be same"
            })
        }else if(newPassword == confirmNewPassword && newPassword == oldPassword){
            return res.status(401).json({
                success:false,
                message:"Password should not be same as the old password"
            })
        }else if(!newPassword || !confirmNewPassword){
            return res.status(401).json({
                success:false,
                message:"All fields are required"
            })
        }

        const isUserExist = await User.findOne({email});

        if(!isUserExist){
            return res.status(401).json({
                success:false,
                message:"User doesn't exist please Signup first"
            })
        }else if(isUserExist){

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updatePassword = await user.findOneAndUpdate(
                {email:email},
                {
                    password:hashedPassword
                },
                {new:true}
            );
        }
        

        
    } catch (error) {
        
    }
} 
    