const {instance} = require("../config/razorpay");
const course = require("../models/Course");
const user = require("../models/User");
const mailSender = require("../utils/mailSender");


//capture the payment and initiate the razorypay order

exports.createPayment  = async(req,res) =>{

try {
        //get course id and user id
        const {courseId} = req.body;
        const {userId} =req.user.id;
        
        //validation
    
        ////valid courseid
    
        if(!courseId){
            return res.status(400).json({
                success:false,
                message:"Please provide valid Course Id"
            })
        };
    
        //valid course details
    
        let course;
        try {
            course = await course.findById({courseId});
    
            if(!course){
                return res.status(400).json({
                    success:false,
                    message:"Could not find the Course"
                })
            }
        } catch (error) {
            
        }
        
        //is user already paid for this code
    
        //the userId is converted to an object now  
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:"You already buy this course"
            })
        }
        
    
} catch (error) {
    console.error(error);
    return res.status(400).json({
        success:false,
        message:"Payment Error"
    })
}

//order creation

const amount = course.price;
const currency = "INR";

const options = {

    amount: amount*100,
    currency,
    recept: Math.random(Date.now()).toString(),
    notes:{
        courseId:courseId,
        userId:userId,
    }
}

  try {
    //initiate the payment using razorpay

    const paymentResponse = await instance.orders.create(options)
        console.log(paymentResponse);


        return res.status(200).json({
            success:true,
            message:"Order Created",
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            oderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        });
    
  } catch (error) {
    console.error(error);
    return res.status(400).json({
        success:false,
        message:"Could not initiate order"
    })
    
  }
}


//verify signature of razorypay and server

exports.verifySignature = async (res,req) => {

    //matching the secret key

    const webhookSecret = "12345678";

    const signature = req.header["x-razorpay-signature"];

    //google these  below three lines
    const shasum = crypto.createHmac("sha256", webhookSecret);

    //changing it into string format 

    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");


    //matching the signatre and digest
    if(signature === digest){
        console.log("Payment is authorized");

        const {courseId, userId} = req.body.payload.entity.notes;

        try {
            //enrolled the student in the course
            const enrolledCourse = await course.findOneAndUpdate(
                {id:courseId},
                {$push:{studentEnrolled:userId}},
                {new:true},
            );


        if(!enrolledCourse){
            return res.status(500).json({
                success:false,
                message:"Course not found"
            });
        }


        //find the studnet and add the course in list of enrolled courses

        const enrolledStudent = await user.findOneAndUpdate(
            {id:userId},
            {$push:{courses:courseId}},
            {new:true}
        );

        console.log(enrolledStudent);


        //confirmation wala mail send krna hai 

        const emailResponse = mailSender(
            enrolledStudent.email,
            "Congrats",
            "Congrats you are Onboarded into the course, Enjoy learning"

        )

        return res.status(200).json({
            success:true,
            message:'Signature verified and course allocated'
        })

        } catch (error) {
            console.error(error);
            return res.status(500).json({
            success:false,
            message:'course not allocated'
        })
        }


    }else{
        return res.status(400).json({
            success:false,
            message:'Signature is not verified'
        })
    }



}
