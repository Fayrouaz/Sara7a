
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
    from: `"Leaf Detect🟢" <${process.env.EMAIL}>`,
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
 
  resetPassword: "Reset Your Password",
  welcome: "Welcome to Leaf Detect",
};
