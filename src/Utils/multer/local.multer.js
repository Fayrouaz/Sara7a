import multer from "multer";
import path from "path";
import fs from "fs";

export const fileValidation = {
  images:["image/png" , "image/jpeg" ,"image/jpg"],
  videos:["video/mp4" , "video/mj2" , "video/mpeg"],
  audios: ["audio/webm" ,"audio/x-pn-realaudio-plugin"],
  documents:["application/pdf" , "application/msword"],
 }

export const localFileUpload=({customPath = 'general' ,validation = []})=>{
  const basePath = `Uploads/${customPath}`
 const storage=multer.diskStorage({
  destination :(req,file,cb) =>{
   //cb(null ,path.resolve("./src/Uploads"))
   let userBasePath = basePath;
   if(req.user?._id) userBasePath += `/${req.user?._id}`
   const fullPath = path.resolve(`./src/${userBasePath}`);
   if(!fs.existsSync(fullPath)) fs.mkdirSync(fullPath ,{recursive:true});
   cb(null , fullPath);
   },
  filename :(req,file,cb) =>{
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) +"-" +file.originalname ;
    file.finalPath = `${basePath}/${req.user._id}/${uniqueSuffix}`
    cb(null,uniqueSuffix)
   },
  
 })

  const fileFilter = (req,file, cb) => {
   if(validation.includes(file.mimetype)){
    cb(null , true);
   }else {
    cb(new Error("Invalid File Type") , fasle)
   }
 }


  return multer({fileFilter , storage});
}

//signatuare  ----> magic number