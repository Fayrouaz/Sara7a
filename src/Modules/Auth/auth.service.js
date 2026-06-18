
import { OAuth2Client } from 'google-auth-library';
import { customAlphabet } from 'nanoid';
import * as dbService from "../../DB/dbService.js";
import { providerEnum, UserModel } from "../../DB/models/user.model.js";
import TokenModel from "../../DB/token.models.js";
import { eventEmitter } from "../../Utils/Events/email.event.utils.js";
import { compare, hash } from "../../Utils/Hashing/hashing.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import { getNewLoginCredientional } from "../../Utils/tokens/token.utils.js";




export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const [firstName, ...rest] = username.trim().split(" ");
  const lastName = rest.join(" ");

  const checKUser = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (checKUser) {
    return next(new Error("User already exists", { cause: 409 }));
  }

  const hashPassword = await hash({ plainText: password });
  const user = await dbService.create({
    model: UserModel,
    data: [{ firstName, lastName, email, password: hashPassword }],
  });

  const actualUser = Array.isArray(user) ? user[0] : user;
  const tokens = await getNewLoginCredientional(actualUser);

  return successResponse({
    res,
    statusCode: 201,
    message: "User created Successfully",
    data: {
      user: {
        id: actualUser._id,
        email: actualUser.email,
        displayName: actualUser.displayName ?? `${firstName} ${lastName}`.trim(),
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 3600,                // ✅ matches login shape
      },
    },
  });
};



export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const checKUser = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (!checKUser) {
    return next(new Error("User Not Found", { cause: 404 }));
  }

  if (!(await compare({ plainText: password, hash: checKUser.password }))) {
    return next(new Error("Invaild Email or Password", { cause: 400 }));
  }



  const credentials = await getNewLoginCredientional(checKUser);

  return successResponse({
    res,
    message: "Login successful",
    data: {
      user: {
        id: checKUser._id,
        email: checKUser.email,
        displayName: checKUser.displayName,
      },
      tokens: {
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        expiresIn: 3600,
      },
    },
  });
};

export const logout = async (req, res, next) => {

  const token = await dbService.findOne({
    model: TokenModel,
    filter: { jwtid: req.decoded.jti }
  })

  if (token) return next(new Error("Token is Revoked", { cause: 400 }));

  await dbService.create({
    model: TokenModel,
    data: [{
      jwtid: req.decoded.jti,
      expiresIn: new Date(req.decoded.exp * 1000),
      userId: req.user._id
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
  const crediontientials = await getNewLoginCredientional(user)
  return successResponse({
    res,
    statusCode: 200,
    message: "Token Refreshes  Successfully🌏",
    data: { crediontientials }
  });
};








export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const otp = await customAlphabet("0123456789", 6)();

  const otpExpireTime = Date.now() + 5 * 60 * 1000; // 5 minutes

  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      //confirmEmail: { $exists: true },
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











//    model:UserModel,
//    email,
//     //confirmEmail:{$exists :true}
//   })


//     if (!user.forgetPasswordOTP || user.forgetPasswordOTPExpire < Date.now()) {
//    return next(new Error("OTP expired, please request a new one", { cause: 400 }));
// }

//   if(!user) return next(new Error("Invliad-Account" ,{cause:404}))  
//   if(!await compare({plainText:otp , hash:user.forgetPasswordOTP}))  return next(new Error("Invlaid OTP" ,{cause:400}))

//     await dbService.updateOne({
//       model:UserModel,
//       filter:{email},
//       data:{
//        password:await hash({plainText:password}),
//        $unset:{forgetPasswordOTP:true},
//        $inc:{__v:1}
//       }
//     })


//   return successResponse({
//     res,
//     statusCode: 200,
//     message: "Password Reseted successfully🔵",

//   });
// };
export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await dbService.findOne({
    model: UserModel,
    filter: { email: email.toLowerCase().trim() }
  });

  if (!user) return next(new Error("Invalid-Account", { cause: 404 }));


  if (!user.forgetPasswordOTP || user.forgetPasswordOTPExpire < Date.now()) {
    return next(new Error("OTP expired, please request a new one", { cause: 400 }));
  }

  const isMatch = await compare({ plainText: otp, hash: user.forgetPasswordOTP });
  if (!isMatch) return next(new Error("Invalid OTP", { cause: 400 }));


  const hashedPassword = await hash({ plainText: password });

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { email: email.toLowerCase().trim() },
    data: {
      $set: { password: hashedPassword },
      $unset: { forgetPasswordOTP: 0, forgetPasswordOTPExpire: 0 },
      $inc: { __v: 1 }
    },
    options: { new: true }
  });

  if (!updatedUser) return next(new Error("Update Failed", { cause: 500 }));

  return successResponse({
    res,
    statusCode: 200,
    message: "Password Reset successfully ✅",
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



async function verifyGooogleAccount({ idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID
  });
  const payload = ticket.getPayload();

  return payload;
}


export const loginWithGmail = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const { email, family_name, email_verified, given_name } =
      await verifyGooogleAccount({ idToken });

    if (email_verified !== true) {
      return next(new Error("Email Not verified", { cause: 401 }));
    }

    const user = await dbService.findOne({
      model: UserModel,
      filter: { email },
    });

    if (user) {
      if (user.provider === providerEnum.GOOGLE) {
        const credentials = await getNewLoginCredientional(user);

        return successResponse({
          res,
          statusCode: 200,
          message: "Login successfully",
          data: {
            user: {
              id: user._id.toString(),
              email: user.email,
              emailVerified: user.emailVerified ?? true,
            },
            tokens: {
              accessToken: credentials.accessToken,
              refreshToken: credentials.refreshToken,
              expiresIn: credentials.expiresIn ?? 3600,
            },
          },
        });
      } else {
        return next(
          new Error("Please login using your original provider", { cause: 400 })
        );
      }
    }

    const newUser = await dbService.create({
      model: UserModel,
      data: {
        firstName: given_name,
        lastName: family_name,
        email,
        provider: providerEnum.GOOGLE,
      },
    });

    const credentials = await getNewLoginCredientional(newUser);

    return successResponse({
      res,
      statusCode: 200,
      message: "Login successfully✨",
      data: {
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          emailVerified: newUser.emailVerified ?? true,
        },
        tokens: {
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          expiresIn: credentials.expiresIn ?? 3600,
        },
      },
    });

  } catch (err) {
    console.log("=== ERROR ===");
    console.log(err.message);
    return next(err);
  }
};