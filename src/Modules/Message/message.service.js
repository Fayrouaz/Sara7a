import * as dbService from "../../DB/dbService.js"
import UserModel from "../../DB/models/user.model.js"
import  MessageModel  from "../../DB/models/message.model.js";
import { successResponse } from "../../Utils/successResponse.utils.js";

export const sendMessage=async(req,res,next)=>{
 const {content} = req.body;
 const { receiverId} = req.params;
 

 const user = await dbService.findById({
   model:UserModel,
   id:receiverId
   
  })


 if(!user) return next(new Error("Reciver Not Found" , {cause:404}))
  const message = await dbService.create({
    model:MessageModel,
    data:[{
     content,
      receiverId:user._id
    }]
   })

return successResponse({
    res,
    statusCode: 200,
    message: "Message sent Successfully🌏",
    data:{message}
  });
  
}



export const getMessage=async(req,res,next)=>{

 const messages = await dbService.find({
   model:MessageModel,
   populate:[{path:"receiverId", select:"firstName lastName eamail -_id"}]
  })


return successResponse({
    res,
    statusCode: 200,
    message: "🟢Message  Fectched Successfully🟢",
    data:{messages}
  });
  
}



