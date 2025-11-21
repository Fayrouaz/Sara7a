
import authRouter from "../Modules/Auth/auth.controller.js"
import userRouter from "../Modules/Users/user.controller.js"
import messageRouter from "../Modules/Message/message.controller.js"
import connectDB from "../DB/connection.js";
import { globalErrorHandler } from "./errorHandler.js";
import path from "path";
import cors from "cors"
import morgan from "morgan";
import { attachRouterWithLogger } from "./Logger/logger.utils.js";


 const bootstrap = async(app,express) =>{
  app.use(express.json());
  app.use(cors());
  await connectDB();
   app.use("/Uploads" ,express.static(path.resolve("./src/Uploads")))
  app.get("/" , (req,res)=>{
  return res.status(200).json({message:"Done"})
  });

attachRouterWithLogger(app ,"/api/v1/auth",authRouter ,"auth.log")
attachRouterWithLogger(app ,"/api/v1/user",authRouter ,"users.log")
attachRouterWithLogger(app ,"/api/v1/message",authRouter ,"message.log")

  app.use("/api/v1/auth",morgan() , authRouter)  
  app.use("/api/v1/user", userRouter)  
  app.use("/api/v1/message" , messageRouter)  

 app.all("/*dummay", (req,res)=>{
    return res.status(404).json({message:"Not Found Handler!!!!"})
  });


 app.use(globalErrorHandler)
 

}


export default bootstrap;

