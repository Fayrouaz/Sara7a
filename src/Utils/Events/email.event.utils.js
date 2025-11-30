
import { EventEmitter } from "node:events";
import { emailSubject } from "../Emails/emails.utils.js";
import { sendEmails } from "../Emails/emails.utils.js";
import { template } from "../Emails/generateHTML.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("confirmEmail", async (data) => {
  await sendEmails({
    to: data.to,
    subject: emailSubject.confirmEmail,
    html: template(data.otp , data.firstName),
  }).catch((error) => {
    console.log(`Error in sending confirmation Email: ${error}`);
  });
});


eventEmitter.on("forgetPassword", async (data) => {
  await sendEmails({
    to: data.to,
    subject: emailSubject.resetPassword,
    html: template(data.otp , data.firstName ,emailSubject.resetPassword),
  }).catch((error) => {
    console.log(`Error in sending confirmation Email: ${error}`);
  });
});

