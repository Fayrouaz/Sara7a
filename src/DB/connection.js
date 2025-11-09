

import mongoose from "mongoose";


export const connectDB = async()=>{

  try{
   await mongoose.connect(
       process.env.DB_URI,
        {
         serverSelectionTimeoutMS:5000,
        }
   )
     console.log("MonogoDB connection Successfullu!!!");
  } catch (error){
    console.log("MonogoDB connection Fuailer" ,error);
    
  }


}

export default connectDB;