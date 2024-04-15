const profile = require("../models/Profile");
const user = require("../models/User");

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
            message:"Profile updated successfully"
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
            message:"Got User data"
        });
    
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:true,
            message:"user data error"
        })
    }
}
   