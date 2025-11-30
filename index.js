

import express from "express";
import bootstrap from "./src/Utils/app.controller.js";
import dotenv from "dotenv";
dotenv.config({ path: "./src/config/.env.dev" });
import chalk from "chalk";
const app = express();
const port =   process.env.PORT  ||  5000 
 await bootstrap(app, express);
app.listen(port,()=>{
console.log(chalk.bgGreen(chalk.black(`✅ Server is Running on http://localhost:${port}`)));
})





