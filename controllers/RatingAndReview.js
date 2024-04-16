const ratingAndReviews = require("../models/RatingAndReviews");
const course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//create rating

exports.createRating = async(req,res) =>{
    try {
        
        //get userid 
        const {userId} = req.userId;
        //fetch data 
        const {rating, review, courseId} = req.body;

        //check if the user is enrolled in courser 
        const courseDetails = await course.findOne(
            {_id:userId, studentEnrolled: {$elemMatch: {$eq:userId}  } } );


        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"student is not enrolled in the course"
            })
        };

        //user is allowed to rate only one time 
        const alreadyReviewed = await ratingAndReviews.findOne({
            user:userId,
            course:courseId,
        })

        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"User Already reviewed"
            });
        }


        
        //create rating and review

        const ratingReview = await ratingAndReviews.create({
            rating, 
            review, 
            course:courseId, 
            user:userId,
    })

        //update in course 

        await course.findByIdAndUpdate({courseId},
        {$push:{
            ratingAndReviews:ratingReview._id,
        }
    },{new:true},)
        
    
    //return res
    return res.status(200).json({
        success:true,
        message:"Rating and review done",
        ratingReview
    });

    } catch (error) {
        console.error(error);
        return res.status(200).json({
            success:true,
            message:"Rating and review done"
        })
    }
}

//get Avg rating 


exports.getAverageRating  = async(req,res) =>{

    try {

        const courseId = req.body.courseId;

        const result = await ratingAndReviews.aggrigate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating: { $avg : "$rating"},
                }
            }
        ])

        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating
            })
        }

        return res.status(200).json({
            success:true,
            message:'Average ratinf is 0, no no rating is given till now',
            averageRating:0,
        })


        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
            averageRating:0,
        })
    }

}



//get all rating

exports.getAllRating = async(req,res)=>{

    try {
        
        const allReview = await ratingAndReviews.find({}).sort({rating:"dec"}).populate({  
                                                                                          path:"user",
                                                                                        select:"firstName lastName email image",
                                                                                    })
                                                                                    .populate({
                                                                                        path:"course",
                                                                                        select:"courseName",
                                                                                    })
                                                                                    .exec();

        return res.status(200).json({
            success:true,
            message:"All fetched successfully",
            data:allReview,
        
        });
        
        
        } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
            averageRating:0,
        })
    
    }
}
