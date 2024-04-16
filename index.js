const express = require("express");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const paymentRoutes = require("./routes/payment");
const courseRoutes = require("./routes/course");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const {cloudinaryConnect} = require("./config/cloudinaryConnect");
const port = process.env.PORT || 4000 ; 

require("dotenv").config();
const app = express();

database.connect();

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin:"https:localhost:3000",
        credentials:true,
    }));

app.use(fileUpload(
    {
        useTempFiles:true,
        tempFileDir:"/tmp",
    }
))

cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);


app.get("/", (req,res)=>{
    return res.json({
        success:true,
        message:"Your server is up and running...."
    });
});

app.listen(port, ()=>{
    console.log(`App is running on ${port}`);
})

