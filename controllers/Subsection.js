const subSection = require("../models/SubSection");
const section = require("../models/Section");
const {uploadImageToCloudinary} =require("../utils/imageUploder")
require("dotenv").config();

//create subsection

exports.createSubsection = async(req,res)=>{
    try {
        
        const {title, timeDuration, description, sectionId} =req.body;

        const video = req.files.videoFile; 

        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }


        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        const subSectionDetails = await subSection.create({
            title:title,
            description:description,
            timeDuration:timeDuration,
            videoUrl:uploadDetails.secure_url,
        });

        const updatedSection = await section.findByIdAndUpdate({_id:sectionId},
                                                     {
                                                        $push:{
                                                            subSection:subSectionDetails._id,
                                                        }
                                                        
                                                     },{new:true},);
    //log updated section here after adding populate query




    return res.status(200).json({
        success:true,
        message:"Sub section created",
        updatedSection
    });

    } catch (error) {
        console.error(error)
        return res.status(200).json({
            success:false,
            message:"Sub section not created"
        });
    }
}