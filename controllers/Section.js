const section = require("../models/Section");
const course = require("../models/Course");

exports.createSection = async(req,res)=>{
    try {
        
        //data fetch
        const {sectionName, courseId} =req.body;


        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }

        const newSection = await section.create({sectionName});

        const updatedCourse = await course.findByIdAndUpdate(courseId,
                                                             {
                                                                $push:{
                                                                    courseContent:newSection._id,
                                                                }
                                                              },
                                                              {new:true},
        );
        //how can i use populate to replace section/subsection both in the updatedCourse

        return res.status(200).json({
            status:true,
            message:"section created successfully",
            updatedCourse,
        });
    } catch (error) {
        console.error(error)
        return res.status(200).json({
            
            status:true,
            message:"Error in create section",
            
        });
    }
}



exports.updateSection = async(req,res) =>{
    try {

        const {sectionName, sectionId}  =req.body;

        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }

        //update data

        const section = await section.findByIdAndUpdate(sectionId,
                                                        {
                                                            sectionName,
                                                        },
                                                    {new:true});

        return res.status(200).json({
          status:true,
          message:"section updated successfully",
          section,
       });

    } catch (error) {
        console.error(error)
        return res.status(200).json({
            
            status:true,
            message:"Error in update  section",
            
        });
    }
}


//delete section

exports.deleteSection = async (req,res)=>{
    try {
        
        const {sectionId}  =req.params;

        //delete data

        await section.findByIdAndDelete(sectionId)

        return res.status(200).json({
          status:true,
          message:"section Deleted successfully",
          section,
       });

    } catch (error) {
        console.error(error)
        return res.status(200).json({
            
            status:true,
            message:"Error in delete section",
            
        });
    }
}