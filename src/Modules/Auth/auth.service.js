
/*
import { UserModel } from "../../DB/models/user.model.js";
//import { asyncHandler } from "../../Utils/asyncHandler.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import * as dbService from "../../DB/dbService.js"
import { asymmetricEncrypt } from "../../Utils/Encryption/encryption.utils.js";
import { hash , compare } from "../../Utils/Hashing/hashing.utils.js";
import { eventEmitter } from "../../Utils/Events/email.event.utils.js";


export const signup =async(req,res ,next)=>{
   const {firstName,lastName,email,password,gender,phone} = req.body;
   const checKUser = await dbService.findOne({model:UserModel , filter :{email} , })
    if(checKUser){
      return next(new Error("User already exists" ,{cause:409}))

    }
   // const encryptedData= encrypt(phone);
 const encryptedData = asymmetricEncrypt(phone);
 const hashPassword = await hash({plainText:password})

    const user = await dbService.create({model:UserModel , data:{firstName,lastName,email,password : hashPassword ,gender,phone :encryptedData}});
   
       eventEmitter.emit("confirmEmail" ,{to:email})
      return  successResponse({res , statusCode:201 , message: "User created Successfully", data:{user}})
 }

///email


export const login =async(req,res ,next)=>{
 
   const {email,password} = req.body;
   const checKUser = await   dbService.findOne({model:UserModel , filter :{email} , })
    if(!checKUser){
    return next(new Error("User Not Found" ,{cause:404}))
    }
    if(!(await compare({password, hash:checKUser.password})))
     return next(new Error("Invaild Email or Password",{cause:400} ) )
   
      return  successResponse({res , statusCode:200, message: "User Loggedin Successfully", data:{checKUser}})


}

*/


import {  providerEnum, UserModel } from "../../DB/models/user.model.js";
import * as dbService from "../../DB/dbService.js";
import { asymmetricEncrypt } from "../../Utils/Encryption/encryption.utils.js";
import { hash, compare } from "../../Utils/Hashing/hashing.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import { eventEmitter } from "../../Utils/Events/email.event.utils.js";
import { customAlphabet } from 'nanoid';
import { generateToken, verifyToken ,getNewLoginCredientional } from "../../Utils/tokens/token.utils.js";
import { v4 as uuidv4 } from 'uuid';
import TokenModel from "../../DB/token.models.js";
 import {OAuth2Client} from'google-auth-library';
import { authenticator } from "otplib";
import QRCode from "qrcode";




export const signup =  async (req, res, next) => {
  const { firstName, lastName, email, password,gender,role, phone } = req.body;


   console.log("REQ BODY:", req.body);

  const checKUser = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (checKUser) {
    return next(new Error("User already exists🤷‍♂️", { cause: 409 }));
  }

  const encryptedData = asymmetricEncrypt(phone);
  const hashPassword = await hash({ plainText: password });
    

  const otp = customAlphabet("0123456789ersdofdfdmdfdds" ,6)();
  const user = await dbService.create({
    model: UserModel,
    data:[{
     firstName, 
     lastName,
     email,
     password: hashPassword, 
     confirmEmailOTP:await hash({plainText:otp}),
     gender,
     role,
     phone: encryptedData }],
     
  });

  eventEmitter.emit("confirmEmail", { to: email  ,otp,firstName });

  return successResponse({
    res,
    statusCode: 200,
    message: "User created Successfully🎉",
    data: { user },
  });
};





export const login = async (req, res, next) => {
  const { email, password   , code} = req.body;
  const checKUser = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (!checKUser) {
    return next(new Error("User Not Found", { cause: 404 }));
  }

  if (!(await compare({plainText: password, hash: checKUser.password }))) {
    return next(new Error("Invaild Email or Password", { cause: 400 }));
  }
/*
   if(!checKUser.confirmEmail)
     return next(new Error("Confirm Your Email ", { cause: 400 }));
  */
  
  if (checKUser.twoFA?.enabled) {
      if (!code) {
        return res.status(200).json({
          codeRequested: true,
          message: "2-step verification code required",
        });
      }

      const verified = authenticator.check(code, checKUser.twoFA.secret);
      if (!verified) {
        return next(new Error("Invalid 2-step verification code", { cause: 400 }));
      }
    }

   const crediontientials = await  getNewLoginCredientional(checKUser)

  
  return successResponse({
    res,
    statusCode: 200,
    message: "User Loggedin Successfully👌",
    data: {crediontientials},
  });
};
/*

  export const generateQR = async(req,res,next)=>{
const { id } = req.query; // ناخد الـ id من query
  if (!id) return res.status(400).send({ success: false, message: "User ID missing" });

  const user = await UserModel.findById(id);
  if (!user) return res.status(404).send({ success: false, message: "User not found" });

  // توليد secret مؤقت للـ 2FA
  const tempSecret = authenticator.generateSecret();

  // توليد URI للـ QR code
  const uri = authenticator.keyuri(user.email, "YourAppName", tempSecret);

  // توليد QR code كـ data URL
  const image = await QRCode.toDataURL(uri);

  // حفظ الـ tempSecret في قاعدة البيانات مؤقتًا
  user.twoFA = {
    ...user.twoFA, // الحفاظ على أي بيانات موجودة
    tempSecret
  };
  await user.save();

return successResponse({
  res,
  statusCode: 200,
  message: "Done",
  data: {
    image // الصورة اللي تولدت من QRCode.toDataURL(uri)
  }
});



}


export const generateQR = async (req, res) => {
  
    const { id } = req.query;

    // 1. التحقق من وجود ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID missing"
      });
    }

    // 2. التصحيح: استخدام dbService لجلب المستخدم
    const user = await dbService.findOne({
      model: UserModel,
      filter: { _id: id } // البحث بالمعرّف
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // توليد secret مؤقت للـ 2FA
    const tempSecret = authenticator.generateSecret();

    // توليد URI للـ QR code (استخدم اسم التطبيق الخاص بك بدلاً من YourAppName)
    const uri = authenticator.keyuri(user.email, "YourAppName", tempSecret);

    // توليد QR code كـ data URL
    const image = await QRCode.toDataURL(uri);

    // 3. التصحيح: استخدام dbService لتحديث بيانات المستخدم وحفظ الـ tempSecret
    await dbService.updateOne({
      model: UserModel,
      filter: { _id: id },
      data: {
        twoFA: {
          // الحفاظ على أي بيانات موجودة وتحديث الـ tempSecret
          ...user.twoFA,
          tempSecret
        }
      }
    });

    // 4. إرسال الرد بالصورة
    return successResponse({
      res,
      statusCode: 200,
      message: "QR code generated successfully",
      data: {
        image
      }
    });


};



export const set2FA = async(req,res , next)=>{
  const { email, code } = req.body;

  // جلب المستخدم من قاعدة البيانات
  const user = await UserModel.findOne({ email });
  if (!user) return next(new Error("User Not Found", { cause: 404 }));

  // التأكد من وجود tempSecret
  const tempSecret = user.twoFA?.tempSecret;
  if (!tempSecret) return next(new Error("2FA not initialized for this user", { cause: 400 }));

  // التحقق من الكود
  const verified = authenticator.check(code, tempSecret);
  if (!verified) return next(new Error("Invalid 2-step verification code", { cause: 400 }));

  // تفعيل 2FA رسميًا ونقل tempSecret لـ secret
  user.twoFA = {
    enabled: true,
    secret: tempSecret,
  };
  await user.save();

  return successResponse({
    res,
    statusCode: 200,
    message: "2FA enabled successfully ✅",
  });

}
*/



export const generateQR = async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return next(new Error("User ID is missing", { cause: 400 }));
  }

  // get user using dbService
  const user = await dbService.findOne({
    model: UserModel,
    filter: { _id: id },
  });

  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }

  // generate temporary secret
  const tempSecret = authenticator.generateSecret();

  // generate QR code uri
  const uri = authenticator.keyuri(user.email, "YourAppName", tempSecret);

  // generate QR image
  const image = await QRCode.toDataURL(uri);

   await UserModel.updateOne(
    { _id: id },
    { $set: { "twoFA.tempSecret": tempSecret } }
  );

  return successResponse({
    res,
    statusCode: 200,
    message: "QR code generated successfully",
    data: { image },
  });
};


export const set2FA = async (req, res, next) => {
  const { email, code } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) return next(new Error("User Not Found", { cause: 404 }));

  console.log("USER FROM DB:", user.twoFA);

  const tempSecret = user.twoFA?.tempSecret;

  if (!tempSecret) {
    return next(new Error("2FA not initialized", { cause: 400 }));
  }

  const verified = authenticator.check(code, tempSecret);
  if (!verified) {
    return next(new Error("Invalid 2-step verification code", { cause: 400 }));
  }

  user.twoFA = {
    enabled: true,
    secret: tempSecret,
    tempSecret: null,
  };

  await user.save();

  return successResponse({
    res,
    statusCode: 200,
    message: "2FA enabled successfully",
  });
};






export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  const checKUser = await dbService.findOne({
    model: UserModel,
    filter: { email  , confirmEmail:{$exists:false},confirmEmailOTP:{$exists:true}},
  });

  if (!checKUser) {
    return next(new Error("User Not Found or email already confirmed", { cause: 404 }));
  }

  if (!(await compare({plainText: otp, hash: checKUser.confirmEmailOTP}))) {
    return next(new Error("Invaild OTP", { cause: 400 }));
  }
  await dbService.updateOne({
    model: UserModel,
    filter: { email },
    data:{
     confirmEmail:Date.now(),
     $unset:{confirmEmailOTP:1},
     $inc:{__v: 1 }
    }
  })

  return successResponse({
    res,
    statusCode: 200,
    message: "Email Confirmed  Successfully✨",
   
  });
};




export const logout = async (req, res, next) => {

 const token=await dbService.findOne({
   model:TokenModel,
  filter:{jwtid:req.decoded.jti}
   })

   if(token)    return next(new Error("Token is Revoked" ,{cause:400}));

 await dbService.create({
  model:TokenModel,
   data:[{
    jwtid:req.decoded.jti,
    expiresIn:new Date(req.decoded.exp *1000),
    userId:req.user._id
   }]
  })


  return successResponse({
    res,
    statusCode: 200,
    message: "Logged out  Successfully🌏",
   
  });
};



export const refreshToken = async (req, res, next) => {

 const user = req.user;
      const crediontientials = await  getNewLoginCredientional(user)
  return successResponse({
    res,
    statusCode: 200,
    message: "Token Refreshes  Successfully🌏",
    data:{crediontientials}
  });
};

/*
export const forgetPassword= async (req, res, next) => {
  const {email} =req.body;
  const otp = await customAlphabet("0123456789dddfgffv" , 6)();


  const user = await dbService.findOneAndUpdate({
   model:UserModel,
   filter:{
    email,
   confirmEmail:{$exists :true},  
   },
    
    data:{
    forgetPasswordOTP:await hash({plainText:otp})
    },
  }
   )

 
   if(!user) return next(new Error("User NOT Found oR Email not confirmed" ,{cause:404}))

    eventEmitter.emit("forgetPassword" , {
     to:email,
     firstName:user.firstName,
     otp,
    })

  return successResponse({
    res,
    statusCode: 200,
    message: "Check Your Box 🔵",

  });
};*/

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const otp = await customAlphabet("0123456789", 6)();

  const otpExpireTime = Date.now() + 5 * 60 * 1000; // 5 minutes

  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
    },
    data: {
      forgetPasswordOTP: await hash({ plainText: otp }),
      forgetPasswordOTPExpire: otpExpireTime,
    },
  });

  if (!user)
    return next(
      new Error("User NOT Found or Email not confirmed", { cause: 404 })
    );

  eventEmitter.emit("forgetPassword", {
    to: email,
    firstName: user.firstName,
    otp,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Check your email, OTP sent ✅",
  });
};






export const  resetPassword= async (req, res, next) => {
  const {email  ,otp , password} =req.body;
 
 
  const user= await dbService.findOne({
   model:UserModel,
   email,
    confirmEmail:{$exists :true}
  })
    if (!user.forgetPasswordOTP || user.forgetPasswordOTPExpire < Date.now()) {
   return next(new Error("OTP expired, please request a new one", { cause: 400 }));
}

  if(!user) return next(new Error("Invliad-Account" ,{cause:404}))  
  if(!await compare({plainText:otp , hash:user.forgetPasswordOTP}))  return next(new Error("Invlaid OTP" ,{cause:400}))

    await dbService.updateOne({
      model:UserModel,
      filter:{email},
      data:{
       password:await hash({plainText:password}),
       $unset:{forgetPasswordOTP:true},
       $inc:{__v:1}
      }
    })
  return successResponse({
    res,
    statusCode: 200,
    message: "Password Reseted successfully🔵",

  });
};




export const updatePassword = async (req, res, next) => {

    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new Error("User not found", { cause: 404 }));
    }
    const isCorrectPassword = await compare({
      plainText: oldPassword,
      hash: user.password,
    });
    if (!isCorrectPassword) {
      return next(new Error("Old password is incorrect", { cause: 400 }));
    }
    const hashedPassword = await hash({ plainText: newPassword });
    await UserModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

   return successResponse({
    res,
    statusCode: 200,
    message: "Password Updated successfully🔵",

  });
};

 async function verifyGooogleAccount({idToken}){
const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
      idToken,
      audience:process.env.CLIENT_ID
  });
    const payload = ticket.getPayload();

     return payload;
 }


export const loginWithGmail= async (req, res, next) => {

  const {idToken} =req.body;

 const {email , family_name,email_verified , given_name}= await verifyGooogleAccount({idToken})
  await verifyGooogleAccount({idToken}) 
   if(!email_verified) return next(new Error("Email Not verified" ,{cause:401}));

   const user= await dbService.findOne({
    model: UserModel,
    filter:{email},
  })

   if(user){
    if(user.provider === providerEnum.GOOGLE){
        const crediontientials = await  getNewLoginCredientional(user)

  
  return successResponse({
    res,
    statusCode: 200,
    message: "Login successfully✨",
    data:{crediontientials}
  });
    }
  }
  const newUser=await dbService.create({
   model:UserModel,
   data:[{
   firstName:given_name,
   lastName:family_name,
   email,
   confirmEmail:Date.now(),
   provider:providerEnum.GOOGLE,
   }]
  })
        const crediontientials = await  getNewLoginCredientional(newUser)


   return successResponse({
    res,
    statusCode: 200,
    message: "Login successfully✨",
    data:{crediontientials}
  });
};

//email , family_name,email_verified , given_name,  picture
//  family_name
/*
//  email_verified

  name
  picture
  given_name
  family_name*/