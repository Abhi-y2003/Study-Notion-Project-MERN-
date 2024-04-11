const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
    },
    accountType:{
        type:String,
        enum:["Admin", "Instructor", "student"],
        required:true,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"profile",
    },
    courses:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"courses",
    },
    image:{
        type:String,
        required:true,
    },
    courseProgress:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"courses"
        }
    ],
}) ;

module.exports =mongoose.model("user", userSchema);