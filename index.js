

import express from "express";
import bootstrap from "./src/Utils/app.controller.js";
import dotenv from "dotenv";
dotenv.config({ path: "./src/config/.env.dev" });
import chalk from "chalk";
const app = express();
const port =   process.env.PORT  ||  5000 // ← fallback ذكي
 await bootstrap(app, express);
app.listen(port,()=>{
console.log(chalk.bgGreen(chalk.black(`✅ Server is Running on http://localhost:${port}`)));
})


/*
{

  "firstName": "Fayrouz",
  "lastName": "Abdalbasset",
  "email": "fayrouzabdalbasset@gmail.com",
  "password": "123456",
  "gender": "FEMALE",
  "phone": "01012345678"
}

 */

//182354175301-6mhbgqpejgmesvbg7gqgq7ort88e8kdu.apps.googleusercontent.com