import * as dbSerivce from "../../DB/dbService.js"
import { UserModel } from "../../DB/models/user.model.js"
import TokenModel from "../../DB/token.models.js";
//import { decrypt } from "../../Utils/Encryption/encryption.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import  {verifyToken} from "../../Utils/tokens/token.utils.js"

export const listAllUsers = async (req,res,next) =>{

let users = await dbSerivce.find({
model:UserModel,
populate:[{path:"messages",select:"content -_id -receiverId"}]
});
/*
users = users.map((user) =>{
  return { ...user._doc,phone:asymmetricDecrypt(user.phone)}
 })
*/
       return  successResponse({res , statusCode:200 , message: "User Fetched Successfully", data:{users}})

}


export const updateProfile= async (req,res,next) =>{

    const { firstName, lastName, gender } = req.body;

    const user= await dbSerivce.findByIdandUpdate({model:UserModel ,id:req.decoded.id,
     data:{ firstName, lastName, gender ,$inc:{__v:1},}
     })
    

  return  successResponse({res , statusCode:200 , message: "User Updated Successfully", data:{user}})
}



export const profileImage= async (req,res,next) =>{
    
  return  successResponse({res , statusCode:200 , message: "Image Updated Successfuly🎉", data:{ file:req.file}})
}
