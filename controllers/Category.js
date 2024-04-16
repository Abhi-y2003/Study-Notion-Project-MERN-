const category =require("../models/Category");


//create category ka handler function

exports.createCategory = async(req,res) =>{
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

        const categoryDetails = await category.create(
            {
                name:name,
                description:description,
            });
            
            console.log(categoryDetails);


            return res.status(200).json({
                Success:true,
                message:"Category created successfully",
            })
    
    
    
    
    
    
    }  catch (error) {
        return res.status(401).json({
            success:false,
            message:error.message,
        })
    }
} 



//get all Categorys handler function 

exports.showAllCategory = async(req,res) => {
    try {
        
        const allCategory = await category.findOne({},{name:true, description:true});
        res.status(200).json({
            success:true,
            message:"All category returned successfully",
            allCategory,
        })
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:error.message,
        });
    }
}



//category page details 

exports.categoryPageDetails = async (req,res)=>{
    try {
        
        //get category id
        const {categoryId} = req.body;

        //get courses for specified category
        const selectedCategory = await category.findById(categoryId).populate("course").exec();

        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Course not found"
            })
        }

        //course for different category / suggestions 
        
        const differentCategory = await category.find({_id: {$ne: categoryId},}).populate("course").exec();


        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategory,
            },
        });

    } catch (error) {
        console.error(error);
        return res.status(401).json({
            success:false,
            message:error.message,
        });
    }
}