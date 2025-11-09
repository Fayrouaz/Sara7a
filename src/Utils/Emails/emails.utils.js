


/*

export async function sendEmails({
  to ="", 
    subject ="",
    text="",
    html = "",
  attachments=[],
  cc ="",
  bcc =""
 }) {

const transporter = nodemailer.createTransport({
   service:"gmail",
  auth: {
    user: "fyrwzbdalbastly@gmail.com",
    pass: "tiou idht evzf nghm",
  },
});

  
  const info = await transporter.sendMail({
  from: '"Route Acadamy👌👌" <fyrwzbdalbastly@gmail.com>',
  to,
  subject,
  text,
  html,
  attachments,
  cc,
  bcc
  });

  console.log("Message sent:", info.messageId);
};
  

export const emailSubject = {
confirmEmail:"Confirm Your Email",
resetPassword:"Reset Your Passwordw",
welcome:"Welcome to Route ACademy"

}
*/
import nodemailer from "nodemailer";
export async function sendEmails({
  to = "",
  subject = "",
  text = "",
  html = "",
  attachments = [],
  cc = "",
  bcc = "",
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:process.env.EMAIL ,
      pass:process.env.PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: `"Route Academy🟢" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
    html,
    attachments,
    cc,
    bcc,
  });
  console.log("Message sent:", info.messageId);
}
export const emailSubject = {
  confirmEmail: "Confirm Your Email",
  resetPassword: "Reset Your Password",
  welcome: "Welcome to Route Academy",
};
