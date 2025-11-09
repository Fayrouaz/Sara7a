import multer from "multer";
import path from "path";

export const localFileUpload=(req,res,next)=>{
 const storage=multer.diskStorage({
  destination :(req,file,cb) =>{
   cb(null ,path.resolve("./src/Uploads"))
   },
  filename :(req,file,cb) =>{
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) +file.originalname ;

    cb(null,uniqueSuffix)
   },
  
 })



  return multer({storage});
}