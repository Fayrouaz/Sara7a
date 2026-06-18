import joi from "joi";
import mongoose from "mongoose";
import { generalFields } from "../../Middleware/validation.middleware.js";

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
  profileImage:String,
  CloudProfileImage:{public_id:String , secure_url : String},
  forgetPasswordOTP:String,
  forgetPasswordOTPExpire: Date,



},
{timestamps:true  , toJSON: {virtuals:true} , toObject:{virtuals:true}})




userSchema.pre("save", function(next) {
  if (this.username) {
    const parts = this.username.trim().split(" ");
    this.firstName = parts[0];
    this.lastName = parts.slice(1).join(" ") || parts[0];
  }
  next();
});

export const UserModel = mongoose.models.User || mongoose.model("User",   userSchema );
export default UserModel;

export const signupSchema = {
  body: joi.object({
    username: joi.string()
      .min(5)
      .max(41)
      .pattern(/^[\p{Script=Arabic}a-zA-Z\s]+$/u)  
      .required()
      .messages({
        'string.pattern.base': 'Username must contain first and last name separated by a space'
      }),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  })
};

