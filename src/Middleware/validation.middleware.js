import joi from "joi"
import { Types } from "mongoose";

export const genderEnum = {
  FEMALE: "FEMALE",
  MALE: "MALE"
};

  export const validation =(Schema)=>{
    return (req,res,next)=>{
     const validationError= [];
     for(const key of Object.keys(Schema)){
          if (!req[key]) req[key] = {};
       const validationResults = Schema[key].validate(  req[key],{abortEarly:false})
      if(validationResults.error){
        validationError.push({key, details:validationResults.error.details})
      }
     }

     if(validationError.length){
      return res.status(400).json({message:"Validation Error" , details:validationError})
    
     }
     return next();
    }
 }



export const generalFields = {

 firstName:joi.string().min(2).max(20).messages({
  "string.min":"First Name must be at least 2 character",
  "string.max":"First Name must be at most  20 character",
   "any.required" :"First name is Mandatory"
  }),
  lastName:joi.string().min(2).max(20).messages({
  "string.min":"Last  Name must be at least 2 character",
  "string.max":"last Name must be at most  20 character",
   "any.required" :"Last name is Mandatory"
  }),
  email:joi.string().email({minDomainSegments:2 , maxDomainSegments:5 ,tlds:{ allow :["com" ,"org" ,"io"]}}),
  password:joi.string(),
  confirmPassword:joi.ref("password"),
  gender:joi.string().valid(...Object.values(genderEnum)).default(genderEnum.MALE),
  phone:joi.string().pattern(new RegExp(/^01[0125][0-9]{8}$/)),
  otp:joi.string(),
  id:joi.string().custom((value,helper) =>{
   return (
   Types.ObjectId.isValid(value)||
   helper.message("Invalid ObjectID Format")
   )
   }),
   file : {
     fieldname : joi.string(),
   originalname:joi.string(),
    encoding: joi.string(),
    mimetype:joi.string(),
    size : joi.number(),
    destination: joi.string(),
    filename:joi.string(),
    finalPath :joi.string(),
    path:joi.string(),
   }
 }


