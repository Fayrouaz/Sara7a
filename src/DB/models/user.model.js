import joi from "joi";
import mongoose from "mongoose";
import { generalFields } from "../../Middleware/validation.middleware.js";
export const genderEnum = {
  FEMALE: "FEMALE",
  MALE: "MALE"
}
export const  providerEnum  = {
  SYSTEM: "SYSTEM",
  GOOGLE: "GOOGLE"
}

export const roleEnum = {
  USER: "USER",
  ADMIN: "ADMIN"
};



const  userSchema = new mongoose.Schema({
  firstName:{
    type:String,
    required:true,
    trim:true,
    minLength: [ 2,"First Name must be at least 2 character"],
    maxLength: [ 20,"First Name must be at most 20 character"],
  },
  lastName:{
    type:String,
    required:true,
    trim:true,
    minLength: [ 2,"First Name must be at least 2 character"],
    maxLength: [ 20,"First Name must be at most 20 character"],
  },
  email:{
   type:String,
   required:true,
   trim:true,
   unique:true,
   lowercase:true
   },
  password:{
   type:String,
   required:function(){
    return providerEnum.GOOGLE ?false:true;
   },

  },
  gender:{
   type:String,
   enum: {
    values: Object.values(genderEnum),
    message:"{VALUE} is not a vaild gender "
   },
   default : genderEnum.MALE
  },
  provider:{
   type:String,
   enum: {
    values: Object.values( providerEnum ),
    message:"{VALUE} is not a vaild gender "
   },
   default :  providerEnum.SYSTEM
  },
  role:{
   type:String,
   enum: {
    values: Object.values( roleEnum ),
    message:"{VALUE} is not a vaild  role"
   },
   default : roleEnum.USER
  },
  phone:String,
  profileImage:String,
  coverImage:[String],
  CloudProfileImage:{public_id:String , secure_url : String},
  CloudCoverImage:[{public_id:String , secure_url : String}],
  confirmEmail:Date,
  confirmEmailOTP:String,
  forgetPasswordOTP:String,
 forgetPasswordOTPExpire: Date,
},
{timestamps:true  , toJSON: {virtuals:true} , toObject:{virtuals:true}})

userSchema.virtual("messages" ,{
  localField:"_id",
  foreignField:"receiverId",
  ref:"Message"
 })

export const UserModel = mongoose.models.User || mongoose.model("User",   userSchema );
export default UserModel;
export const signupSchema = {
  body: joi.object({
    firstName: generalFields.firstName.required(),
    lastName: generalFields.lastName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword,
    gender: generalFields.gender,
    phone: generalFields.phone,
    role: joi.string()
      .valid("USER", "ADMIN")
      .default(roleEnum.USER)
  }

  )
};
