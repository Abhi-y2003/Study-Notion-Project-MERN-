const course = require("../models/Course");
const category = require("../models/Category");
const user = require("../models/User");

const {uploadImageToCloudinary} = require("../utils/imageUploder");
require("dotenv").config();


//create Curse handler
exports.createCourse = async (req,res) => {
    try {

        //fetch data 
        const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnail;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail){
            return res.json({
                success:false,
                message:"All fields are required"
            });
        }

        //check for instructor details for db call object id 

        const userId = req.user.id;
        const instructorDetails  = await user.findById(userId);
        console.log("Instructor Details:", instructorDetails);


        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details not found",
            })
        }


        //check give category is valid or not

        const categoryDetails = await category.findbyId(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category details not found",
            })
        }


        //upload image on cloudinary

        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create a entry for new course

        const newCourse = await course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category:categoryDetails._id,
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
            success:true,
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