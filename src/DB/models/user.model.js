import mongoose from "mongoose";
export const genderEnum = {
  FEMALE: "FEMALE",
  MALE: "MALE"
}
export const  providerEnum  = {
  SYSTEM: "SYSTEM",
  GOOGLE: "GOOGLE"
}

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
  phone:String,
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