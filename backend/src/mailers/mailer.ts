import nodemailer from "nodemailer";
import { Env } from "../config/env.config";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const transporter = nodemailer.createTransport({
  host: Env.MAIL_HOST,          
  port: Number(Env.MAIL_PORT),  
  secure: Env.MAIL_SECURE === "true", 
  auth: {
    user: Env.MAIL_USER,         
    pass: Env.MAIL_PASS,        
  },
});

const mailer_sender = `Finora <${Env.MAIL_FROM || Env.MAIL_USER}>`;

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}: Params) => {
  const mailOptions = {
    from,
    to: Array.isArray(to) ? to.join(",") : to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
