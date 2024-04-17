//send otp
const user = require("../models/User");
const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require('otp-generator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const profile = require("../models/Profile")
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

exports.signUp = async (req,res) =>{


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
    
    
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
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
        
    
        const response = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log(response);

       
        //validating otp
        if(!response){
            //otp not found
            return res.status(400).json({
                success:false,
                message:"Otp not found"
            })
        }else if (otp !== response?.otp){
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

        
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebaear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        

        return res.status(200).json({
            success:true,
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
    // Get email and password from request body
    const { email, password } = req.body

    // Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      })
    }

    // Find user with provided email
    const user = await User.findOne({ email }).populate("additionalDetails")

    // If user not found with provided email
    if (!user) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      })
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, accountType: user.accountType },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      )

      // Save token to user document in database
      user.token = token
      user.password = undefined
      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      })
    }
  } catch (error) {
    console.error(error)
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
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
    