const profile = require("../models/Profile");
const user = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploder")

exports.updateProfile = async(req,res) =>{
    try {
        //getdata
        const {dateOfBirth="", about="", contactNumber, gender } = req.body;

        //middleware me payload me dale the id and role
        const id = req.user.id;

        if(!contactNumber || !gender || !id){
             return res.status(400).json({
                success:false,
                message:"All fields are required"
             })
        }
        //find profile of the user 
        const userDetails = await user.findById(id);
        const profileId = userDetails.additionalDetails

        const profileDetails = await profile.findById(profileId);

        //updation
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save(); 


        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            data:profileDetails,

        })

    } catch (error) {
        
        return res.status(401).json({
            success:false,
            message:"Profile updation error"
        })
    }
}


exports.deleteAccount = async(req,res) =>{
    try {

        //get id
        const id = req.user.id;
        //valdation
        const userDetails = await user.findById(id);

        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"No user found "
            })
        }
        //profile delete

        await profile.findByIdAndDelete(userDetails.additionalDetails);
        //delete user

        //schedule this delete  req
        await user.findByIdAndDelete(id);

        //update in enrolled students 

        return res.status(200).json({
            success:true,
            message:"User deleted Successfully"
        })
    } catch (error) {
        console.error(error);
        
        return res.status(401).json({
            success:true,
            message:"User not deleted"
        })
    }
}



exports.getAllUserDetails = async (req,res)=>{

    try {
        
        const id = req.user.id;

        const userDetails = await user.findById(id).populate("additionalDetails").exec();
    
        return res.status(200).json({
            success:true,
            message:"Got User data",
            data:userDetails,
        });
    
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:true,
            message:"user data error"
        })
    }
}
   
exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      return res.status(200).json({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec()
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].subSection.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnroled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }