const course = require("../models/Course");
const category = require("../models/Category");
const user = require("../models/User");

const {uploadImageToCloudinary} = require("../utils/imageUploder");
require("dotenv").config();


//create Curse handler
exports.createCourse = async (req,res) => {
    try {

        //fetch data 
        console.log("one")
        const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body;

        console.log("two")
        //get thumbnail
        //console.log(req.body.thumbnailImage)
        const thumbnail = req.files.thumbnailImage 
        console.log("one")

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category ){
            return res.json({
                success:false,
                message:"All fields are required"
            });
        }

        //check for instructor details for db call object id 

        console.log("four")
        const userId = req.user.id;
        const instructorDetails  = await user.findById(userId);
        console.log("Instructor Details:", instructorDetails);

        console.log("five")

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details not found",
            })
        }


        //check give category is valid or not
        const categoryDetails = await category.findById(category)
        if (!categoryDetails) {
          return res.status(404).json({
            success: false,
            message: "Category Details Not Found",
          })
        }


        //upload image on cloudinary

        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create a entry for new course

        const newCourse = await course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails,
            whatYouWillLearn: whatYouWillLearn,
            price,
            thumbnail:thumbnailImage.secure_url,
        });


        //add the newCourse to the user Schema of the instructor
        await user.findByIdAndUpdate(
            {id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true},
            );

        //updating the category schema






        return res.status(200).json({
            success:true,
            message:"course created successfully",
            data:newCourse
        })
    } catch (error) {
        console.error(error);
        return res.status(200).json({
            success:false,
            message:"Failed to create course",
        })
    }
}



//get allcourser handler funciton

exports.showAllCourses = async (req,res) => {
    try {
        const allCourses = await courses.find({},{courseName:true,
                                                  price:true,
                                                  thumbnail:true,
                                                  instructor:true,
                                                  RatingAndReviews:true,
                                                  studentEnrolled:true,})
                                                  .populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched",
        })

    } catch (error) {
        console.error(error);
        return res.status(401).json({
            success:true,
            message:"Failed to show course",
        })
    }
}


exports.getCourseDetails = async(req,res) =>{
    try {
        //get id
        const {courseId} = req.body;


        //find course details 
        const courseDetails = await find(
            {courseId}).populate(
                {
                    path:"instructor",
                    populate:{
                        path:"additionalDetails",
                    }
                }
            )
            .populate("category")
            .populate("RatingAndReviews")
            .populate({
                path:"courseContent",
                populate:{
                    path:"subSection",
                }
            });


            if(!courseDetails){
                return res.status(400).json({
                    success:false,
                    message:`could not find the course with ${courseId}`
                })
            }

        return res.status(200).json({
                success:true,
                message:`Course details with ${courseId}`,
                data:courseDetails
            })


    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success:false,
            message:error.message,
        })
    }
}