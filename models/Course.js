const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
   
    courseName:{
        type:String,
    },
    courseDescription:{
        type:String,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    whatYouWillLearn:{
        type:String,

    },
    courseContent:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"section",
        }
    ],
    ratingAndReviews:[

        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"ratingAndReviews",
        }
    ],
    price:{
        type:Number
    },
    thumbnail:{
        type:String
    },
    tag:{
        type:String
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category"
    },
    studentEnrolled:[
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"user"
        }
    ]
    
}) ;

module.exports =mongoose.model("course", courseSchema);