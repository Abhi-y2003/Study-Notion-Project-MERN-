const express = require("express");
const router = express.Router();

//importing the required controllers and middleware 

const{
    login,
    signUp,
    sendOtp,
    changePassword,
} = require("../controllers/Auth");

const {resetPasswordToken, resetPassword} = require("../controllers/ResetPassword");

const { auth } = require("../middlewares/auth");


// //Route for user login
 router.post("/login", login)

// // Route for user signup
 router.post("/signUp", signUp)

// // Route for sending OTP to the user's email
 router.post("/sendOtp", sendOtp)

// // Route for Changing the password
 router.post("/changepassword", auth, changePassword)

//Not defined
// // // Route for generating a reset password token
  router.post("/resetpasswordtoken", resetPasswordToken)

// // // Route for resetting user's password after verification
  router.post("/reset-password", resetPassword)



module.exports = router;