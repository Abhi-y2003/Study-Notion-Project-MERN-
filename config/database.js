const mongoose = require("mongoose");
require("dotenv").config();


exports.connect = ()=>{
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>console.log("Database connection successful"))
    .catch((error)=>{
        console.error(error);
        console.log("error in connection to database");
        process.exit(1);
    });
};