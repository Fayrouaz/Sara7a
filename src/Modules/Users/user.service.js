import * as dbSerivce from "../../DB/dbService.js"
import { UserModel } from "../../DB/models/user.model.js"
import { successResponse } from "../../Utils/successResponse.utils.js";
import { cloudinaryConfig } from "../../Utils/multer/cloudinary.config.js";



export const listAllUsers = async (req, res, next) => {

  let users = await dbSerivce.find({
    model: UserModel,
    populate: [{ path: "messages", select: "content -_id -receiverId" }]
  });

  return successResponse({ res, statusCode: 200, message: "User Fetched Successfully", data: { users } })

}


export const updateProfile = async (req, res, next) => {

  const { firstName, lastName, gender } = req.body;

  const user = await dbSerivce.findByIdandUpdate({
    model: UserModel, id: req.decoded.id,
    data: { firstName, lastName, gender, $inc: { __v: 1 }, }
  })


  return successResponse({ res, statusCode: 200, message: "User Updated Successfully", data: { user } })
}
export const getProfileImage = async (req, res, next) => {
  try {
    const user = await dbSerivce.findById({
      model: UserModel,
      id: req.user._id,
    });

    return successResponse({
      res,
      statusCode: 200,
      message: 'Profile Image🎉',
      data: { user }
    });
  } catch (error) {
    console.log('>>> getProfileImage error:', error); // will show exact crash
    next(error);
  }
};


export const profileImage = async (req, res, next) => {


  const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(req.file.path, {
    folder: `ProfileImage/users/${req.user._id}`
  })
  const user = await dbSerivce.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: { CloudProfileImage: { public_id, secure_url } }
  })

  if (req.user.CloudProfileImage?.public_id) {
    await cloudinaryConfig().uploader.destroy(req.user.CloudProfileImage?.public_id)
  }
  return successResponse({ res, statusCode: 200, message: " Profile Image🎉", data: { user } })
}



