const tag =require("../models/Tag");


//create tag ka handler function

exports.createTag = async(req,res) =>{
    try {
        
        const {name, description} = req.body;

        //validation
        if(!name || !description){
            return res.status(401).json({
                success:false,
                message:"All fields are required",
            });
        }

        //creating an entery in db

        const tagDetails = await Tag.create(
            {
                name:name,
                description:description,
            });
            
            console.log(tagDetails);


            return res.status(200).json({
                Success:true,
                message:"Tag created successfully",
            })
    
    
    
    
    
    
    }  catch (error) {
        return res.status(401).json({
            success:false,
            message:error.message,
        })
    }
} 



//get all tags handler function 

exports.showAllTags = async(req,res) => {
    try {
        
        const allTags = await tag.findOne({},{name:true, description:true});
        res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            allTags,
        })
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:error.message,
        });
    }
}

