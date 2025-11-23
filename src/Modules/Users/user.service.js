import * as dbSerivce from "../../DB/dbService.js"
import { roleEnum, UserModel } from "../../DB/models/user.model.js"
import TokenModel from "../../DB/token.models.js";
//import { decrypt } from "../../Utils/Encryption/encryption.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import  {verifyToken} from "../../Utils/tokens/token.utils.js"
import { cloudinaryConfig } from "../../Utils/multer/cloudinary.config.js";
//import { date } from "joi";


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


  const {public_id , secure_url} =  await cloudinaryConfig().uploader.upload(req.file.path , {
   folder : `Sara7aApp/users/${req.user._id}`
 })
   const user =  await dbSerivce.findOneAndUpdate({
     model:UserModel,
     filter:{_id : req.user._id},
     data:{  CloudProfileImage : {public_id , secure_url}  }
    })

    if(req.user.CloudProfileImage ?.public_id){
      await cloudinaryConfig().uploader.destroy(req.user.CloudProfileImage ?.public_id)
     }
  return  successResponse({res , statusCode:200 , message: " Profile Image🎉", data:{user}})
}

 
/*

export const coverImages = async (req,res,next) =>{

  const attachments = [];
  for( const file of req.files){
   const {public_id , secure_url} = await cloudinaryConfig().uploader.upload(file.path , {
   folder : `Sara7aApp/users/${req.user._id}`
   })
   attachments.push( {public_id , secure_url});
  }

    const user =  await dbSerivce.findOneAndUpdate({
     model:UserModel,
     filter:{_id : req.user._id},
     data:{  CloudCoverImage: attachments}
    })
  return  successResponse({res , statusCode:200 , message: " Cover Images Updates Sucessfully🎉", data:{ user}})
}

*/


export const coverImages = async (req, res, next) => {


  if (req.user.CloudCoverImage && Array.isArray(req.user.CloudCoverImage)) {
    for (const img of req.user.CloudCoverImage) {
      if (img.public_id) {
        await cloudinaryConfig().uploader.destroy(img.public_id);
      }
    }
  }

  const attachments = [];
  for (const file of req.files) {
    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `Sara7aApp/users/${req.user._id}`,
      }
    );
    attachments.push({ public_id, secure_url });
  }

  const user = await dbSerivce.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: { CloudCoverImage: attachments },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Cover Images Updated Successfully 🎉",
    data: { user },
  });
};



export const freezedAccount = async(req,res,next)=>{
  const {userId} = req.params;

  if(userId && req.user.role !== roleEnum.ADMIN){
    return next(new Error("YOU are not Authorized to freeze Account"));
 }
  const updatedUser = await dbSerivce.findOneAndUpdate({
   model:UserModel,
   filter:{
    _id:userId || req.user._id , 
    freezeAt :{$exists : false},
   },
   data:{
    freezeAt:Date.now(),
    freezedBy: req.user._id
   }
  })
   return updatedUser 
   ? successResponse({
     res,
      statusCode:200,
     message:"Profile Freezed Successfully",
     data:{user : updatedUser}
   })
   :next(new Error("Invalid Account"))
}


export const restoreAccount = async(req,res,next)=>{
  const {userId} = req.params;

 
  const updatedUser = await dbSerivce.findOneAndUpdate({
   model:UserModel,
   filter:{
    _id  :userId  , 
    freezeAt :{$exists : true},
    freezedBy  :{$exists : true},
   },
   data:{
     $unset: {
     freezeAt : true, 
     freezedBy  : true,
   },
   restoredAt : Date.now(),
  restoredBy : req.user._id,
   },
  })
   return updatedUser 
   ? successResponse({
     res,
      statusCode:200,
     message:"Profile Restored Successfully🎉",
     data:{user : updatedUser}
   })
   :next(new Error("Invalid Account"))
}
